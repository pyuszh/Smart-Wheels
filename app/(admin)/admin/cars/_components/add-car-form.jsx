"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { addCar, processCarImageWithAI } from "@/actions/cars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "SOLD", "PENDING"];

// ✅ Schema is correctly placed OUTSIDE and ABOVE the component
const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "SOLD", "PENDING"]), // Match constants
    featured: z.boolean().default(false),
  });

const AddCarForm = () => {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ai");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedAiImage, setUploadedAiImage] = useState(null);

  // useForm Hook (SINGLE DEFINITION)
  const {
    register: formRegister,
    handleSubmit: handleFormSubmit,
    watch: watchForm,
    setValue: setFormValue,
    getValues: getFormValues,
    formState: { errors: formErrors },
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  // API Fetch Hooks
  const {
    loading: processImageLoading,
    fn: processImageFn,
    data: processImageResult,
    error: processImageError,
  } = useFetch(processCarImageWithAI);

  const {
    data: addCarResult,
    loading: addCarLoading,
    fn: addCarFn,
  } = useFetch(addCar);

  // 2. EFFECTS
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (processImageError) {
      toast.error(processImageError.message || "Failed to analyze image");
    }
  }, [processImageError]);

  useEffect(() => {
    if (processImageResult?.success) {
      const carDetails = processImageResult.data;
      // ✅ Update form using the aliased setFormValue
      // ✅ Safe handling for Year (converts number to string, or defaults to empty)
setFormValue("year", carDetails.year?.toString() ?? "");

// ✅ Safe handling for all other fields (defaults to empty string if AI returns null)
setFormValue("make", carDetails.make ?? "");
setFormValue("model", carDetails.model ?? "");
setFormValue("color", carDetails.color ?? "");
setFormValue("bodyType", carDetails.bodyType ?? "");
setFormValue("fuelType", carDetails.fuelType ?? "");
setFormValue("price", carDetails.price ?? "");
setFormValue("mileage", carDetails.mileage ?? "");
setFormValue("transmission", carDetails.transmission ?? "");
setFormValue("description", carDetails.description ?? "");

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(uploadedAiImage);

      toast.success("Successfully extracted car details");
      setActiveTab("manual");
    }
  }, [processImageResult, uploadedAiImage, setFormValue]);

  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car added successfully");
      router.push("/admin/cars");
    }
  }, [addCarResult, router]);

  // 3. HANDLERS
  const onAiDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setUploadedAiImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onMultiImagesDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter(f => f.size <= 5 * 1024 * 1024);
    const newImages = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === validFiles.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } = useDropzone({
    onDrop: onAiDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
  });

  const { getRootProps: getMultiImageRootProps, getInputProps: getMultiImageInputProps } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: true,
  });

  const processWithAI = async () => {
    if (!uploadedAiImage) return toast.error("Please upload an image first");
    const data = new FormData();
    data.append("file", uploadedAiImage);
    await processImageFn(data);
  };

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) return setImageError("Please upload at least one image");
    const parsedCarData = {
      ...data,
      year: parseInt(data.year),
      price: parseFloat(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
    };
    await addCarFn({ carData: parsedCarData, images: uploadedImages });
  };

  const removeImage = (index) => setUploadedImages((prev) => prev.filter((_, i) => i !== index));

  // 4. HYDRATION GATE
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 5. RENDER JSX
  return (
    <div className="p-6">
      <Tabs defaultValue="ai" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>Enter the details of the car manually.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" {...formRegister("make")} placeholder="e.g. Toyota" className={formErrors.make ? "border-red-500" : ""} />
                    {formErrors.make && <p className="text-xs text-red-500">{formErrors.make.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" {...formRegister("model")} placeholder="e.g. Camry" className={formErrors.model ? "border-red-500" : ""} />
                    {formErrors.model && <p className="text-xs text-red-500">{formErrors.model.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" {...formRegister("year")} placeholder="e.g. 2022" className={formErrors.year ? "border-red-500" : ""} />
                    {formErrors.year && <p className="text-xs text-red-500">{formErrors.year.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" {...formRegister("price")} placeholder="e.g. 25000" className={formErrors.price ? "border-red-500" : ""} />
                    {formErrors.price && <p className="text-xs text-red-500">{formErrors.price.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input id="mileage" {...formRegister("mileage")} placeholder="e.g. 15000" className={formErrors.mileage ? "border-red-500" : ""} />
                    {formErrors.mileage && <p className="text-xs text-red-500">{formErrors.mileage.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" {...formRegister("color")} placeholder="e.g. Blue" className={formErrors.color ? "border-red-500" : ""} />
                    {formErrors.color && <p className="text-xs text-red-500">{formErrors.color.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select onValueChange={(v) => setFormValue("fuelType", v)} value={watchForm("fuelType")}>
                      <SelectTrigger className={formErrors.fuelType ? "border-red-500" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{fuelTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select onValueChange={(v) => setFormValue("transmission", v)} value={watchForm("transmission")}>
                      <SelectTrigger className={formErrors.transmission ? "border-red-500" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{transmissions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select onValueChange={(v) => setFormValue("bodyType", v)} value={watchForm("bodyType")}>
                      <SelectTrigger className={formErrors.bodyType ? "border-red-500" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{bodyTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...formRegister("description")} className={formErrors.description ? "border-red-500" : ""} />
                    {formErrors.description && <p className="text-xs text-red-500">{formErrors.description.message}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3 border p-4 col-span-full rounded-md">
                    <Checkbox id="featured" checked={watchForm("featured")} onCheckedChange={(c) => setFormValue("featured", !!c)} />
                    <div className="grid gap-1.5 leading-none"><Label htmlFor="featured">Feature this Car</Label></div>
                </div>

                <div className="col-span-full space-y-2">
                  <Label className={imageError ? "text-red-500" : ""}>Images</Label>
                  <div {...getMultiImageRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${imageError ? "border-red-500" : "border-gray-300"}`}>
                    <input {...getMultiImageInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">Click or drag images here</p>
                  </div>
                  {imageError && <p className="text-xs text-red-500">{imageError}</p>}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group aspect-video">
                        <Image src={img} alt="Preview" fill className="object-cover rounded-md" />
                        <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(i)}><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={addCarLoading}>{addCarLoading ? <Loader2 className="animate-spin" /> : "Add Car"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader><CardTitle>AI Extraction</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {imagePreview ? (
                <div className="text-center">
                  <img src={imagePreview} alt="AI Preview" className="max-h-56 mx-auto rounded-lg mb-4" />
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={() => {setImagePreview(null); setUploadedAiImage(null);}}>Remove</Button>
                    <Button onClick={processWithAI} disabled={processImageLoading}>{processImageLoading ? <Loader2 className="animate-spin" /> : "Analyze"}</Button>
                  </div>
                </div>
              ) : (
                <div {...getAiRootProps()} className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer">
                  <input {...getAiInputProps()} />
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <p>Drag or click to upload one car image for AI analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddCarForm;