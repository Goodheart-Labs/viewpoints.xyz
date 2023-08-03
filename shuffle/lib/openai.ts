import { Configuration, OpenAIApi } from "openai";

if (typeof window !== "undefined") {
  throw new Error("This file should not be imported on the client side.");
}

// OpenAI API library
// -----------------------------------------------------------------------------

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

// Tokeniser
// -----------------------------------------------------------------------------

export { default as tiktoken } from "tiktoken-node";
