import {
  describe,
  it,
  expect,
  beforeEach
} from "vitest";
import { ApiKeyService } from "#/services/ApiKeyService";
import { ApiKeyRepository } from "#/repositories/ApiKeyRepository";
import { apiKeyFactory, createApiKeyWithKnownRandomPart } from "#/__tests__/factories/ApiKeyFactory";
import { ApiKeyScope } from "@prisma/client";
import bcrypt from "bcrypt";

describe("ApiKeyService", () => {
  let service: ApiKeyService;
  let repository: ApiKeyRepository;

  beforeEach(() => {
    repository = new ApiKeyRepository();
    service = new ApiKeyService(repository);
  });

  describe("createApiKey", () => {
    it("should create a new API key with the correct format", async () => {
      const createData = {
        name: "Test API Key"
      };

      const result = await service.createApiKey(createData);

      expect(result).toEqual(expect.objectContaining({
        id: expect.any(String) as string,
        apiKey: expect.stringMatching(/^ak\.[a-f0-9-]+\..+$/) as string
      }));

      const apiKeyParts = result.apiKey.split('.');
      expect(apiKeyParts).toHaveLength(3);
      expect(apiKeyParts[0]).toBe('ak');
      expect(apiKeyParts[1]).toBe(result.id);
    });

    it("should create a new API key with the correct scopes and is active", async () => {
      const createData = {
        name: "Test API Key"
      };

      const result = await service.createApiKey(createData);
      const apiKey = await repository.findActiveById(result.id);
      for (const scope of Object.values(ApiKeyScope))
        expect(service.hasScope(apiKey!, scope)).toBe(true);

      expect(apiKey?.isActive).toBe(true);
      expect(apiKey?.name).toBe(createData.name);
      expect(apiKey?.createdAt).toBeInstanceOf(Date);
    });

    it("should create a new API key with custom scopes", async () => {
      const createData = {
        name: "Test API Key",
        scopes: [ApiKeyScope.WALLET_READ]
      };

      const result = await service.createApiKey(createData);
      const apiKey = await repository.findActiveById(result.id);
      expect(service.hasScope(apiKey!, ApiKeyScope.WALLET_READ)).toBe(true);
      expect(service.hasScope(apiKey!, ApiKeyScope.WALLET_CREATE)).toBe(false);
      expect(service.hasScope(apiKey!, ApiKeyScope.WALLET_TRANSFER)).toBe(false);
    });

    it("should create API key with hashed random part", async () => {
      const createData = {
        name: "Test API Key"
      };

      const result = await service.createApiKey(createData);
      const dbKey = await repository.findActiveById(result.id);

      expect(dbKey?.keyHash).toBeDefined();
      expect(dbKey?.keyHash).not.toBe('');

      const apiKeyParts = result.apiKey.split('.');
      const randomPart = apiKeyParts[2];
      const isValid = await bcrypt.compare(randomPart, dbKey!.keyHash);
      expect(isValid).toBe(true);
    });
  });

  describe("validateApiKey", () => {
    it("should return API key data when valid", async () => {
      const { apiKey, fullApiKey } = await createApiKeyWithKnownRandomPart({
        name: "Valid API Key",
        scopes: [ApiKeyScope.WALLET_READ, ApiKeyScope.WALLET_CREATE]
      });

      const result = await service.validateApiKey(fullApiKey);

      expect(result).toEqual(expect.objectContaining({
        id: apiKey.id,
        name: apiKey.name,
        scopes: apiKey.scopes,
        isActive: true,
        keyHash: apiKey.keyHash,
        createdAt: expect.any(Date) as Date
      }));
    });

    it("should return null when API key format is invalid", async () => {
      const invalidApiKeys = [
        "invalid-format",
        "ak.only-two-parts",
        "wrong.prefix.randompart",
        "ak..empty-id",
        ""
      ];

      for (const invalidKey of invalidApiKeys) {
        const result = await service.validateApiKey(invalidKey);
        expect(result).toBeNull();
      }
    });

    it("should return null when API key ID doesn't exist", async () => {
      const nonExistentApiKey = "ak.non-existent-id.random-part";
      
      const result = await service.validateApiKey(nonExistentApiKey);
      
      expect(result).toBeNull();
    });

    it("should return null when API key is inactive", async () => {
      const { fullApiKey } = await createApiKeyWithKnownRandomPart({
        name: "Inactive API Key",
        isActive: false
      });

      const result = await service.validateApiKey(fullApiKey);

      expect(result).toBeNull();
    });

    it("should return null when random part doesn't match hash", async () => {
      const { apiKey } = await createApiKeyWithKnownRandomPart({
        name: "Test API Key"
      });

      const invalidApiKey = `ak.${apiKey.id}.wrong-random-part`;
      
      const result = await service.validateApiKey(invalidApiKey);
      
      expect(result).toBeNull();
    });

    it("should handle bcrypt comparison errors gracefully", async () => {
      const apiKey = await apiKeyFactory.create({
        name: "Test API Key",
        keyHash: "invalid-hash-format"
      });

      const testApiKey = `ak.${apiKey.id}.some-random-part`;
      
      const result = await service.validateApiKey(testApiKey);
      
      expect(result).toBeNull();
    });
  });

  describe("hasScope", () => {
    it("should return true when API key has the required scope", async () => {
      const apiKey = await apiKeyFactory.create({
        scopes: [ApiKeyScope.WALLET_READ, ApiKeyScope.WALLET_CREATE]
      });

      expect(service.hasScope(apiKey, ApiKeyScope.WALLET_READ)).toBe(true);
      expect(service.hasScope(apiKey, ApiKeyScope.WALLET_CREATE)).toBe(true);
    });

    it("should return false when API key doesn't have the required scope", async () => {
      const apiKey = await apiKeyFactory.create({
        scopes: [ApiKeyScope.WALLET_READ]
      });

      expect(service.hasScope(apiKey, ApiKeyScope.WALLET_TRANSFER)).toBe(false);
      expect(service.hasScope(apiKey, ApiKeyScope.WALLET_CREATE)).toBe(false);
    });

    it("should work with all available scopes", async () => {
      const apiKeyWithAllScopes = await apiKeyFactory.create({
        scopes: [ApiKeyScope.WALLET_READ, ApiKeyScope.WALLET_CREATE, ApiKeyScope.WALLET_TRANSFER]
      });

      const apiKeyWithNoScopes = await apiKeyFactory.create({
        scopes: []
      });

      expect(service.hasScope(apiKeyWithAllScopes, ApiKeyScope.WALLET_READ)).toBe(true);
      expect(service.hasScope(apiKeyWithAllScopes, ApiKeyScope.WALLET_CREATE)).toBe(true);
      expect(service.hasScope(apiKeyWithAllScopes, ApiKeyScope.WALLET_TRANSFER)).toBe(true);

      expect(service.hasScope(apiKeyWithNoScopes, ApiKeyScope.WALLET_READ)).toBe(false);
      expect(service.hasScope(apiKeyWithNoScopes, ApiKeyScope.WALLET_CREATE)).toBe(false);
      expect(service.hasScope(apiKeyWithNoScopes, ApiKeyScope.WALLET_TRANSFER)).toBe(false);
    });
  });
});
