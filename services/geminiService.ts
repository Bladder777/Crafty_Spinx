import { GoogleGenAI } from "@google/genai";

/**
 * Generates a product image for a craft item using the Gemini API.
 */
export async function generateProductImage(
  name: string,
  description: string
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // A detailed prompt to guide the model towards a product photo style
    const prompt = `A high-quality, charming studio product photograph of a handmade crochet toy named '${name}'. 
    Full description: '${description}'.
    The toy should be the central focus, sharply detailed, and appealing.
    The background should be a solid, clean, light pastel color, and slightly blurred to make the product stand out.
    The lighting should be soft and even, highlighting the texture of the yarn.
    The style should be cute, whimsical, and professional, suitable for an online store catalog.
    Do not include any text, logos, or watermarks in the image.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1', // Square images for the cards
        },
    });

    const firstImage = response.generatedImages?.[0];
    if (firstImage?.image?.imageBytes) {
      const base64ImageBytes: string = firstImage.image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    return null;
  } catch (error) {
    console.error(`Error generating image for ${name}:`, error);
    // Return null to indicate failure, allowing the app to keep the placeholder
    return null; 
  }
}
