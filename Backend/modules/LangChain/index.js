/*import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import readline from "node:readline";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function chat() {
  rl.question("You: ", async (message) => {

    if (message.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
    });

    console.log("AI:", response.text);
    chat();
  });
}

chat();*/

//version web

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const enviarMensaje = async (mensaje) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: mensaje
  });

  return response.text;
};

module.exports = {
  enviarMensaje
};