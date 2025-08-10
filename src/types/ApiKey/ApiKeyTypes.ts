import { ApiKey as PrismaApiKey, ApiKeyScope } from "@prisma/client";

export type ApiKey = PrismaApiKey;

export interface ApiKeyCreateData {
  name: string;
  scopes?: ApiKeyScope[];
  keyHash: string;
}

export interface ApiKeyCreateInput {
  name: string;
  scopes?: ApiKeyScope[];
}

export interface ApiKeyCreateResponse {
  id: string;
  apiKey: string;
}

export interface ParsedApiKey {
  id: string;
  randomPart: string;
}

export { ApiKeyScope };
