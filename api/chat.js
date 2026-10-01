import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed",
    });
  }

  try {
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing",
      });
    }

    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction: `
You are Namma Sevai, a Tamil-first AI assistant for first-time digital users.

Your job is to help a person who has:
- no English knowledge
- no technical knowledge
- never used government websites before

Rules:
- Reply in very simple Tamil when the user speaks Tamil.
- Keep answers short and easy.
- Explain ONE step at a time.
- Avoid complicated English and technical words.
- Never invent government rules, documents, fees, deadlines, or eligibility.
- If you are not certain about a government requirement, clearly say it must be verified on the official government website.
- Help the user understand what to do next.
`,
      },
    });

    return res.status(200).json({
      reply: response.text,
    });
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return res.status(500).json({
      error: error?.message || String(error),
    });
  }
}