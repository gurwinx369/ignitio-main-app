// Singleton Gemini client.
// Change KYLE_MODEL here to swap the underlying model everywhere in one line.

import { GoogleGenerativeAI } from "@google/generative-ai";

export const KYLE_MODEL = "gemini-2.5-flash";

let client = null;

function getClient() {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// Returns the model instance. System instruction and temperature are passed per call.
export function getModel() {
  return getClient().getGenerativeModel({ model: KYLE_MODEL });
}
