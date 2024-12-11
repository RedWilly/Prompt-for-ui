"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UploadHero() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsLoading(true);
      const formData = new FormData();
      formData.append("image", acceptedFiles[0]);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate prompt");
        }

        setGeneratedPrompt(data.prompt);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate prompt",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card
        {...getRootProps()}
        className={`p-8 border-dashed cursor-pointer ${
          isDragActive ? "border-primary" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Drop your design here or click to upload
          </h3>
          <p className="text-sm text-muted-foreground">
            Supports PNG, JPG, JPEG, and WebP
          </p>
        </div>
      </Card>

      {isLoading && (
        <div className="mt-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Generating your prompt...</p>
        </div>
      )}

      {generatedPrompt && !isLoading && (
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Prompt</h3>
          <p className="text-sm whitespace-pre-wrap mb-4">{generatedPrompt}</p>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(generatedPrompt);
              toast({
                title: "Copied!",
                description: "Prompt copied to clipboard",
              });
            }}
          >
            Copy to Clipboard
          </Button>
        </Card>
      )}
    </div>
  );
}