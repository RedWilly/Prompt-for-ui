"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { PromptSteps } from "@/components/prompt-steps";

export function UploadHero() {
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setSelectedImage({
        file,
        preview: URL.createObjectURL(file),
      });
    },
  });

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? "border-primary bg-primary/10" : "border-muted"}
          ${selectedImage ? "border-primary/50" : ""}
        `}
      >
        <input {...getInputProps()} />
        {selectedImage ? (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <Image
              src={selectedImage.preview}
              alt="Preview"
              width={800}
              height={400}
              className="rounded-lg mx-auto"
              style={{ maxHeight: "400px", width: "auto" }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Drop your image here</p>
              <p className="text-sm text-muted-foreground">
                or click to select a file
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, JPEG, WEBP
            </p>
          </div>
        )}
      </div>

      {selectedImage && (
        <Card className="p-6">
          <PromptSteps 
            imageFile={selectedImage.file}
            onComplete={() => {
              toast.success("All prompts generated successfully!");
            }}
          />
        </Card>
      )}
    </div>
  );
}