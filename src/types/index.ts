import { Part } from "@google/generative-ai";
import { Content } from "@google/generative-ai";

export enum GeminiAIModel {
  PRO = "gemini-pro",
  FLASH = "gemini-1.5-flash-latest",
}

export interface GeminiMessage extends Content {
  // Add any additional properties or methods specific to GeminiMessage
  createdAt?: any;
}

export type Role = "assistant" | "user" | "system";
