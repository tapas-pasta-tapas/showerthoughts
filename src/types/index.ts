import { Content } from "@google/generative-ai";
import { DefaultSession } from "next-auth";

export enum GeminiAIModel {
  PRO = "gemini-pro",
  FLASH = "gemini-1.5-flash-latest",
}

export interface GeminiMessage extends Content {
  // Add any additional properties or methods specific to GeminiMessage
  createdAt?: any;
}

export type Role = "assistant" | "user" | "system";

export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  accounts: Account[];
  sessions: Session[];
  Authenticator: Authenticator[];
  createdAt: Date;
  updatedAt: Date;
  JournalEntries: JournalEntry[];
};

export enum Sender {
  USER = "USER",
  MODEL = "MODEL",
}

// Request Objects **************************************************************

export type CustomSessionUser = {
  id?: string | null;
  email: string;
} & DefaultSession["user"];

declare module "next-auth" {
  interface Session {
    user?: CustomSessionUser;
  }
}

export type CreateJournalEntryRequest = {
  title: string;
  contents: TextObject[];
};

// Schema Objects **************************************************************

export type TextObject = {
  id: string;
  sender: Sender;
  content: string;
  JournalEntry: JournalEntry | null;
  journalEntryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JournalEntry = {
  id: string;
  title: string;
  contents: TextObject[];
  User: User | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Account = {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};

export type Session = {
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};

export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};

export type Authenticator = {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
  user: User;
};
