"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { file } from "zod";

// ✅ Stable initialization for 2026
const ai = new GoogleGenAI({
  apiKey: "AIzaSyAO5QZzGyMHNs08TSyw4GUca9LfiosyiL0", // Replace with your key
  httpOptions: { apiVersion: "v1" }, // Forces stable endpoint
});

async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function processCarImageWithAI(formData) {
  try {
    if (!formData) throw new Error("No data received.");

    const file = formData.get("file");
    if (!file) throw new Error("No image file received.");

    const base64Image = await fileToBase64(file);

    // ✅ FIX: Use the updated '@google/genai' calling pattern
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              // ✅ Step 1: Force "Strict JSON Only" in the prompt
              text: `EXTRACT JSON ONLY. NO PROSE. NO INTRO. NO "This image".
              Schema: { "make": string, "model": string, "year": number, "color": string, "price": string, "mileage": string, "bodyType": string, "fuelType": string, "transmission": string, "description": string, "confidence": number }`,
            },
            {
              inlineData: {
                data: base64Image,
                mimeType: file.type,
              },
            },
          ],
        },
      ],
      config: {
        response_mime_type: "application/json",
      },
    });

    // ✅ FIX: Access 'text' directly as a property of the response object
    const text = response.text;
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return { success: true, data: JSON.parse(cleanedText) };
  } catch (error) {
    // Handling 503 Overloaded or 429 Quota errors
    if (error.message.includes("503") || error.message.includes("overloaded")) {
      throw new Error(
        "Google servers are busy. Please wait 30 seconds and try again.",
      );
    }
    throw new Error("AI Processing failed: " + error.message);
  }
}

export async function addCar(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { carData, images } = data;
    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    );

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");
      const filePath = `${folderPath}/img-${Date.now()}-${i}.jpeg`;

      const { error } = await supabase.storage
        .from("car-images")
        .upload(filePath, imageBuffer, { contentType: "image/jpeg" });

      if (error) throw error;
      imageUrls.push(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`,
      );
    }

    await db.car.create({
      data: { ...carData, id: carId, images: imageUrls },
    });

    revalidatePath("/admin/cars");
    return { success: true };
  } catch (error) {
    throw new Error("Database error: " + error.message);
  }
}

export async function getCars(search = "") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    let where = {};
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // ✅ FIX: Ensure we map over the results and convert Decimals/Dates to plain numbers/strings
    const serializedCars = cars.map((car) => serializeCarData(car));

    return { success: true, data: serializedCars };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
} 
export async function deleteCar(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // 1. Delete the car from the database
    await db.car.delete({
      where: { id },
    });

    // 2. Storage Cleanup Logic
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("car-images")
          .remove(filePaths);

        if (error) {
          console.error("Error deleting images from Supabase:", error);
        }
      }
    } catch (StorageError) {
      console.error("Error with Storage operations:", error);
    }

    revalidatePath("/admin/cars");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCarStatus(id, { status, featured }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Explicitly define the update object
    const dataToUpdate = {};
    
    // Prisma Enums are strict. Ensure we send exact matches: AVAILABLE, SOLD, or UNAVAILABLE
    if (status) {
      dataToUpdate.status = status.toUpperCase(); 
    }
    
    if (typeof featured === "boolean") {
      dataToUpdate.featured = featured;
    }

    const updatedCar = await db.car.update({
      where: { id },
      data: dataToUpdate,
    });

    console.log("Database updated successfully:", updatedCar.status);

    revalidatePath("/admin/cars");
    // Also revalidate the specific car page if it exists
    revalidatePath(`/cars/${id}`); 

    return { success: true, data: updatedCar };
  } catch (error) {
    console.error("PRISMA UPDATE ERROR:", error);
    return { success: false, error: error.message };
  }
}

// Add this to the bottom of actions/cars.js
const serializeCarData = (obj) => {
  const serialized = { ...obj };
  
  // 1. Convert Decimal to Number so it can pass to Client Component
  if (obj.price && typeof obj.price.toNumber === "function") {
    serialized.price = obj.price.toNumber();
  } else if (obj.price) {
    serialized.price = Number(obj.price);
  }

  // 2. Convert Dates to Strings
  if (obj.createdAt) serialized.createdAt = obj.createdAt.toISOString();
  if (obj.updatedAt) serialized.updatedAt = obj.updatedAt.toISOString();
  
  return serialized;
};

// Add this to the bottom of actions/cars.js
export async function getFeaturedCars() {
  try {
    const cars = await db.car.findMany({
      where: { 
        featured: true,
        status: "AVAILABLE" 
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // ✅ THE FIX: Map over the cars and apply the serializer 
    // This converts Decimal prices to plain numbers and Dates to strings
    return cars.map((car) => serializeCarData(car));
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    return [];
  }
}