import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Text / Assistant Chat
export async function sendChatMessage(history: any[], message: string) {
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are an elite Crypto and OSRS Gold Investment Advisor. Use sophisticated high-finance jargon (e.g., liquidity pools, arbitrage, alpha generation, order book, slippage) combined with Runescape terminology (e.g., Grand Exchange, High Alch value, staking). Be professional, precise, and transparent about theoretical risks. Never give legitimate financial advice, always add a disclaimer.",
    }
  });

  // Replay history
  for (const msg of history) {
    if (msg.role === "user") await chat.sendMessage({ message: msg.content });
    // Note: The SDK manages history automatically if we use the same chat instance natively, 
    // but here we just pass the history as part of the context for simplicity or instantiate with history if supported.
  }
  
  const response = await chat.sendMessage({ message });
  return response.text;
}

// 2. Search Grounding for Market Intelligence
export async function analyzeMarketWithSearch(asset: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Give me a 2-sentence market analysis of the recent news surrounding ${asset}.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
}

// 3. Fast Tooltips (Lite)
export async function explainJargonFast(term: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    config: {
      systemInstruction: "Define this investment or gaming trading term in one concise sentence.",
    },
    contents: term,
  });
  return response.text;
}

// 4. Image Generation for Custom Tokens
export async function generateTokenImage(prompt: string, size: "1K"|"2K"|"4K" = "1K") {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: prompt,
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1",
      }
    }
  });
  
  // Extract base64 image part
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

// 5. TTS for accessibility / market digests
export async function generateTTS(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: text,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Zephyr" }
        }
      }
    }
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/mp3;base64,${base64Audio}`;
  }
  return null;
}
