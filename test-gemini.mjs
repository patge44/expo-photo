import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    // Note: listModels might not be available on all SDK versions or requires specific setup
    // but we can try a direct fetch or check documentation
    console.log("Tentative de connexion avec la clé:", process.env.GEMINI_API_KEY?.substring(0, 5) + "...");
    
    // Test direct avec gemini-1.5-flash (standard)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Succès avec gemini-1.5-flash:", result.response.text());
  } catch (err: any) {
    console.error("Erreur avec gemini-1.5-flash:", err.message);
  }
}

list();
