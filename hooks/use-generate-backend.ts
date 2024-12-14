import { useState } from "react";
import sonner from "sonner";

export const useGenerateBackend = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateBackend = async (prompt1: string, prompt2: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/ai/generate-backend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt1, prompt2 }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate backend prompt");
      }

      const data = await response.json();
      return data.prompt;
    } catch (error) {
      sonner.toast.error("Failed to generate backend prompt");
      console.error("[USE_GENERATE_BACKEND_ERROR]", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateBackend,
    isLoading,
  };
};
