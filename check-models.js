const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    console.log("Clé (début):", process.env.GEMINI_API_KEY?.substring(0, 5));
    
    // On essaie de lister les modèles (seulement via v1beta ou v1 ?)
    // Note: listModels est une méthode du client
    const samples = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
    
    for (const m of samples) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test");
            console.log(`Modèle ${m} : OK`);
        } catch (e) {
            console.log(`Modèle ${m} : Erreur -> ${e.message}`);
        }
    }
  } catch (err) {
    console.error("Erreur globale:", err.message);
  }
}

listModels();
