import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import {
  ApiKey,
  ApiKeyCreateInput,
  ApiKeyCreateResponse,
  ParsedApiKey,
  ApiKeyScope
} from "#/types/ApiKey/ApiKeyTypes";
import logger from "#/providers/Logger";
import { ApiKeyRepository } from "#/repositories/ApiKeyRepository";

export class ApiKeyService {
  private apiKeyRepository = new ApiKeyRepository();

  private generateRandomPart(): string {
    const keyBytes = randomBytes(32);
    return keyBytes.toString('base64url');
  }

  /**
   * Creates a new API key in the database
   */
  async createApiKey(data: ApiKeyCreateInput): Promise<ApiKeyCreateResponse> {
    const randomPart = this.generateRandomPart();
    const keyHash = await bcrypt.hash(randomPart, 10);
    const result = await this.apiKeyRepository.createApiKey({
      keyHash,
      name: data.name,
      scopes: data.scopes || Object.values(ApiKeyScope)
    });

    const apiKey = `ak.${result.id}.${randomPart}`;

    return { id: result.id, apiKey };
  }

  private parseApiKey(apiKey: string): ParsedApiKey | null {
    const parts = apiKey.split('.');
    if (parts.length !== 3 || parts[0] !== 'ak')
      return null;
    
    return {
      id: parts[1],
      randomPart: parts[2]
    };
  }

  /**
   * Validates an API key and returns the key data if valid
   */
  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    const parsed = this.parseApiKey(apiKey);

    if (!parsed) return null;

    const dbKey = await this.apiKeyRepository.findActiveById(parsed.id);

    if (!dbKey) return null;

    try {
      const isValid = await bcrypt.compare(parsed.randomPart, dbKey.keyHash);
      if (isValid)
        return {
          id: dbKey.id,
          keyHash: dbKey.keyHash,
          name: dbKey.name,
          scopes: dbKey.scopes,
          isActive: dbKey.isActive,
          createdAt: dbKey.createdAt
        };
    } catch (error) {
      logger.error(`[ApiKeyService] - Failed to verify API key hash for keyId: ${parsed.id}.`);
    }

    return null;
  }

  /**
   * Checks if an API key has a specific scope
   */
  hasScope(apiKey: ApiKey, requiredScope: keyof typeof ApiKeyScope): boolean {
    const scopeValue = ApiKeyScope[requiredScope];
    return apiKey.scopes.includes(scopeValue);
  }
}
