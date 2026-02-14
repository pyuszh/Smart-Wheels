"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Camera, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { processCarImageWithAI } from "@/actions/cars"; 
import useFetch from "@/hooks/use-fetch";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageSearch, setIsImageSearch] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  // This function bridges your UI to your Gemini AI Server Action
  const processImageSearch = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await processCarImageWithAI(formData);
  };

  // --- FIXED: Only one useFetch block with unique naming ---
  const {
    loading: isProcessing,
    fn: processImageFn,
    data: processResult,
    error: processError,
  } = useFetch(processImageSearch);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`); 
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image to search");
      return;
    }
    await processImageFn(searchImage);
  };

  useEffect(() => {
    if (processError) {
      toast.error(
        "Failed to analyze image: " + (processError.message || "Unknown error")
      );
    }
  }, [processError]);

  useEffect(() => {
    if (processResult?.success) {
      const params = new URLSearchParams();
      if (processResult.data.make) params.set("make", processResult.data.make);
      if (processResult.data.bodyType) params.set("bodyType", processResult.data.bodyType);
      if (processResult.data.color) params.set("color", processResult.data.color);

      toast.success("AI Analysis complete! Finding your car...");
      router.push(`/cars?${params.toString()}`);
    }
  }, [processResult, router]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };

      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image file");
      };
      reader.readAsDataURL(file); 
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxFiles: 1,
  });

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Enter make, model, or use our AI Image Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/90 backdrop-blur-sm"
          />

          <div className="absolute right-[100px]">
            <Camera
              size={35}
              onClick={() => setIsImageSearch(!isImageSearch)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isImageSearch ? "black" : "",
                color: isImageSearch ? "white" : "",
              }}
            />
          </div>

          <Button
            type="submit"
            className="absolute right-2 rounded-full"
          >
            Search
          </Button>
        </div>
      </form>

      {isImageSearch && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <Image
                    src={imagePreview}
                    alt="Preview of uploaded car"
                    width={320}
                    height={160}
                    className="h-40 object-contain mb-4"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setSearchImage(null);
                      toast.info("Image removed");  
                    }}
                  >
                    Remove Image  
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer text-center">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  </div>
                  <p className="text-gray-500 mb-2">
                    {isDragActive && !isDragReject
                      ? "Leave the file here to upload"
                      : "Drag & drop a car image or click to select"}
                  </p>
                  {isDragReject && (
                    <p className="text-red-500 mb-2">Invalid image type</p>
                  )}
                  <p className="text-gray-400 text-sm">
                    Supports: JPG, PNG (max 5MB)
                  </p>
                </div>
              )}
            </div>

            {imagePreview && (
              <Button 
                type="submit"
                className="mt-4 w-full"
                disabled={isUploading || isProcessing}
              >
                {isUploading 
                ? "Uploading..." 
                :isProcessing 
                ? "Analyzing Image..."
              : "Search with this Image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;