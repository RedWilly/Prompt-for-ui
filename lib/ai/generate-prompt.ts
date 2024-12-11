import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function generatePrompt(imageFile: File) {
  const bytes = await imageFile.arrayBuffer();
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "Generate a detailed prompt that would recreate this website design exactly. Include specific details about layout, colors, typography, spacing, and components.";
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: imageFile.type,
        data: Buffer.from(bytes).toString("base64")
      }
    }
  ]);

  return result.response.text();
}