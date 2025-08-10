import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Not enough text provided to summarize.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // A clear, direct prompt for better results
    const prompt = `Please provide a concise, easy-to-read summary of the following text extracted from a webpage. Focus on the main points and ignore any irrelevant navigation links, menus, or footer information. Present the summary in clean paragraphs.

    TEXT TO SUMMARIZE:
    ---
    ${text}
    ---
    
    CONCISE SUMMARY:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    res.status(200).json({ summary });

  } catch (error) {
    console.error("Error summarizing text:", error);
    res.status(500).json({ error: "Failed to generate summary." });
  }
}
