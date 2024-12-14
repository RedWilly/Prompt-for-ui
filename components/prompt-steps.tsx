import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Check, Copy } from "lucide-react";
import { PromptStep } from "@/types/prompt";

interface PromptStepsProps {
  imageFile?: File;
  onComplete?: () => void;
}

export function PromptSteps({ imageFile, onComplete }: PromptStepsProps) {
  const [steps, setSteps] = useState<PromptStep[]>([
    {
      id: 1,
      title: "UI Analysis",
      description: "Analyzing the UI design and generating initial prompt",
      content: "",
      isCompleted: false,
      isLoading: false,
    },
    {
      id: 2,
      title: "Additional Pages",
      description: "Generating prompts for additional pages",
      content: "",
      isCompleted: false,
      isLoading: false,
    },
    {
      id: 3,
      title: "Backend Architecture",
      description: "Generating backend implementation guide",
      content: "",
      isCompleted: false,
      isLoading: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const progress = (currentStep / steps.length) * 100;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", {
        description: "The prompt has been copied to your clipboard.",
      });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Please try again.",
      });
    }
  };

  const updateStep = (index: number, updates: Partial<PromptStep>) => {
    setSteps(currentSteps =>
      currentSteps.map((step, i) =>
        i === index ? { ...step, ...updates } : step
      )
    );
  };

  const handleGeneratePrompt = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      // Reset steps
      setSteps(steps.map(step => ({ ...step, isLoading: false, isCompleted: false, content: "" })));
      setCurrentStep(0);

      // Step 1: Initial Prompt
      updateStep(0, { isLoading: true });
      const formData = new FormData();
      formData.append("image", imageFile);

      const response1 = await fetch("/api/ai/generate", {
        method: "POST",
        body: formData,
      });

      if (!response1.ok) {
        const data = await response1.json().catch(() => ({}));
        if (response1.status === 402 && data.canUpgrade) {
          toast.error("Usage limit exceeded", {
            description: "Please upgrade to continue using the service.",
          });
          return;
        }
        throw new Error("Failed to generate initial prompt");
      }

      const data1 = await response1.json();
      updateStep(0, { content: data1.prompt, isCompleted: true, isLoading: false });
      setCurrentStep(1);

      // Step 2: Additional Pages
      updateStep(1, { isLoading: true });
      const response2 = await fetch("/api/ai/generate-additional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: data1.prompt,
        }),
      });

      if (!response2.ok) {
        const data = await response2.json().catch(() => ({}));
        if (response2.status === 402 && data.canUpgrade) {
          toast.error("Usage limit exceeded", {
            description: "Please upgrade to continue using the service.",
          });
          return;
        }
        throw new Error("Failed to generate additional pages");
      }

      const data2 = await response2.json();
      updateStep(1, { content: data2.prompt, isCompleted: true, isLoading: false });
      setCurrentStep(2);

      // Step 3: Backend Architecture
      updateStep(2, { isLoading: true });
      const response3 = await fetch("/api/ai/generate-backend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: data1.prompt,
          additionalPrompt: data2.prompt,
        }),
      });

      if (!response3.ok) {
        const data = await response3.json().catch(() => ({}));
        if (response3.status === 402 && data.canUpgrade) {
          toast.error("Usage limit exceeded", {
            description: "Please upgrade to continue using the service.",
          });
          return;
        }
        throw new Error("Failed to generate backend architecture");
      }

      const data3 = await response3.json();
      updateStep(2, { content: data3.prompt, isCompleted: true, isLoading: false });

      // Save to history
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await fetch("/api/prompt-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: reader.result,
              initialPrompt: data1.prompt,
              additionalPrompt: data2.prompt,
              backendPrompt: data3.prompt
            })
          });
        } catch (error) {
          console.error("Error saving to history:", error);
        }
      };
      reader.readAsDataURL(imageFile);

    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", {
        description: "Failed to generate prompts. Please try again.",
      });
      // Reset loading states
      setSteps(steps.map(step => ({ ...step, isLoading: false })));
    }
  };

  return (
    <div className="space-y-8">
      <Progress value={progress} className="w-full" />

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Step {step.id}: {step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {step.isLoading && <Loader2 className="animate-spin" />}
              {step.isCompleted && <Check className="text-green-500" />}
            </div>

            {step.content && (
              <div className="space-y-4">
                <Textarea
                  value={step.content}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(step.content)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Button
        onClick={handleGeneratePrompt}
        disabled={!imageFile || steps.some(step => step.isLoading)}
        className="w-full"
      >
        {steps.some(step => step.isLoading) ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Prompts"
        )}
      </Button>
    </div>
  );
}