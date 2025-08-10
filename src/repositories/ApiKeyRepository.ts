import { db } from "#/providers/Database/PrismaClient";
import { ApiKeyCreateData } from "#/types/ApiKey/ApiKeyTypes";

export class ApiKeyRepository {
  async createApiKey(data: ApiKeyCreateData) {
    return db.apiKey.create({
      data: {
        keyHash: data.keyHash,
        name: data.name,
        scopes: data.scopes,
      },
    });
  }

  async findActiveById(id: string) {
    return db.apiKey.findUnique({
      where: {
        id,
        isActive: true,
      },
    });
  }

  /**
   * Deactivates an API key. Not used for the challenge.
   */
  async deactivateApiKey(keyId: string) {
    await db.apiKey.update({
      where: { id: keyId },
      data: { isActive: false }
    });
  }
}
