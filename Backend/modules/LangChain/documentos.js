/*import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import readline from "node:readline";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const archivo = process.argv[2];

if (!archivo) {
  console.log("Uso: node documentosn.js archivo.pdf");
  process.exit();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("¿Qué quieres hacer con el documento? ", async (promptUsuario) => {

  const contents = [
    { text: promptUsuario },
    {
      inlineData: {
        mimeType: "application/pdf",
        data: Buffer.from(
          fs.readFileSync(archivo)
        ).toString("base64")
      }
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents
  });

  console.log("\nAI:\n");
  console.log(response.text);

  rl.close();
});*/


//version web

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const analizarPdf = async (archivo, prompt) => {
  console.log("Analizando PDF:", archivo);
  console.log("Prompt del usuario:", prompt);
  const contents = [
    { text: prompt },
    {
      inlineData: {
        mimeType: "application/pdf",
        data: Buffer.from(
          fs.readFileSync(archivo)
        ).toString("base64")
      }
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents
  });

  console.log("Respuesta de la IA:", response.text);

  return response.text;
};

module.exports = {
  analizarPdf
};