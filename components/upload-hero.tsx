"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function UploadHero() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrompt2, setIsLoadingPrompt2] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedPrompt2, setGeneratedPrompt2] = useState("");
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
      setGeneratedPrompt("");
      setGeneratedPrompt2("");
    },
  });

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImage.file);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
      setGeneratedPrompt2(""); // Reset second prompt when generating first one
    } catch (error: any) {
      setIsLoading(false);
      if (error.canUpgrade) {
        toast.error(error.message, {
          description: "Upgrade to continue using the service",
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/pricing"
          }
        });
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrompt2 = async () => {
    if (!selectedImage || !generatedPrompt) return;

    setIsLoadingPrompt2(true);
    const formData = new FormData();
    formData.append("image", selectedImage.file);
    formData.append("existingPrompt", generatedPrompt);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate second prompt");
      }

      const data = await response.json();
      setGeneratedPrompt2(data.prompt);
    } catch (error: any) {
      setIsLoadingPrompt2(false);
      if (error.canUpgrade) {
        toast.error(error.message, {
          description: "Upgrade to continue using the service",
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/pricing"
          }
        });
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setIsLoadingPrompt2(false);
    }
  };

  const handleClearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    setGeneratedPrompt("");
    setGeneratedPrompt2("");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {!selectedImage ? (
        <Card
          {...getRootProps()}
          className={`p-8 border-dashed cursor-pointer transition-colors duration-200 ${
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
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image
              src={selectedImage.preview}
              alt="Preview"
              width={800}
              height={400}
              className="w-full object-contain max-h-[400px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background/90"
              onClick={handleClearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Prompt"
              )}
            </Button>
          </div>
        </div>
      )}

      {generatedPrompt && !isLoading && (
        <div className="container mt-8">
          <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-muted flex flex-col h-[400px] sm:h-[450px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-4 gap-3 sm:gap-2">
                <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Design Analysis</h3>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPrompt);
                      toast.success("Copied to clipboard", {
                        description: "The prompt has been copied to your clipboard"
                      });
                    }}
                    className="hover:bg-primary/10 flex-1 sm:flex-none"
                  >
                    Copy to Clipboard
                  </Button>
                  {!generatedPrompt2 && (
                    <Button
                      size="sm"
                      onClick={handleGeneratePrompt2}
                      disabled={isLoadingPrompt2}
                      className="bg-primary/90 hover:bg-primary flex-1 sm:flex-none"
                    >
                      {isLoadingPrompt2 ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Prompt 2"
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/10 hover:[&::-webkit-scrollbar-thumb]:bg-primary/20">
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
                    <p className="whitespace-pre-wrap leading-relaxed">{generatedPrompt}</p>
                  </div>
                </div>
              </div>
            </Card>

            {generatedPrompt2 && !isLoadingPrompt2 && (
              <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-muted flex flex-col h-[400px] sm:h-[450px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-4 gap-3 sm:gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-secondary to-secondary/50 bg-clip-text text-transparent">Additional Pages</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPrompt2);
                      toast.success("Copied to clipboard", {
                        description: "The second prompt has been copied to your clipboard"
                      });
                    }}
                    className="hover:bg-secondary/10 w-full sm:w-auto"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-secondary/10 hover:[&::-webkit-scrollbar-thumb]:bg-secondary/20">
                  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                    <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
                      <p className="whitespace-pre-wrap leading-relaxed">{generatedPrompt2}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}