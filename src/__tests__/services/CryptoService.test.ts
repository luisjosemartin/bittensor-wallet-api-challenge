import {
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest';
import { CryptoService } from '#/services/CryptoService';
import { UnauthenticatedError } from '#/errors/UnauthenticatedError';

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const testPassword = 'TestPassword123!';

  beforeEach(() => {
    cryptoService = new CryptoService();
  });

  describe('encryptData', () => {
    it('should encrypt data successfully', async () => {
      const result = await cryptoService.encryptData(testData, testPassword);

      expect(result.encryptedData).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.passwordHash).toBeDefined();
      
      expect(result.encryptedData.split(':')).toHaveLength(3);
      expect(result.salt).toMatch(/^[0-9a-f]{64}$/);
      expect(result.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should produce different results for same data (due to random salt/IV)', async () => {
      const result1 = await cryptoService.encryptData(testData, testPassword);
      const result2 = await cryptoService.encryptData(testData, testPassword);

      expect(result1.encryptedData).not.toBe(result2.encryptedData);
      expect(result1.salt).not.toBe(result2.salt);
      expect(result1.passwordHash).not.toBe(result2.passwordHash);
    });

    it('should handle empty data', async () => {
      const emptyData = new Uint8Array(0);
      const result = await cryptoService.encryptData(emptyData, testPassword);

      expect(result.encryptedData).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.passwordHash).toBeDefined();
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'Pássw0rd!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = await cryptoService.encryptData(testData, specialPassword);

      expect(result.encryptedData).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.passwordHash).toBeDefined();
    });
  });

  describe('decryptData', () => {
    it('should decrypt data successfully with correct password', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const decrypted = cryptoService.decryptData(
        encrypted.encryptedData,
        encrypted.salt,
        testPassword
      );

      expect(decrypted.data).toEqual(testData);
    });

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      
      expect(() =>
        cryptoService.decryptData(
          encrypted.encryptedData,
          encrypted.salt,
          'WrongPassword123!'
        )
      ).toThrow(UnauthenticatedError);
    });

    it('should fail to decrypt with corrupted encrypted data', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const corruptedData = encrypted.encryptedData.replace(/.$/, '0'); // Change last character
      
      expect(() =>
        cryptoService.decryptData(corruptedData, encrypted.salt, testPassword)
      ).toThrow(UnauthenticatedError);
    });

    it('should fail to decrypt with invalid encrypted data format', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      
      expect(() =>
        cryptoService.decryptData('invalid:format', encrypted.salt, testPassword)
      ).toThrow(UnauthenticatedError);
    });

    it('should fail to decrypt with corrupted salt', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const corruptedSalt = encrypted.salt.replace(/.$/, '0'); // Change last character
      
      expect(() =>
        cryptoService.decryptData(
          encrypted.encryptedData,
          corruptedSalt,
          testPassword
        )
      ).toThrow(UnauthenticatedError);
    });

    it('should handle round-trip encryption/decryption of large data', async () => {
      const largeData = new Uint8Array(50000);
      for (let i = 0; i < largeData.length; i++) 
        largeData[i] = i % 256;
      

      const encrypted = await cryptoService.encryptData(largeData, testPassword);
      const decrypted = cryptoService.decryptData(
        encrypted.encryptedData,
        encrypted.salt, 
        testPassword
      );

      expect(decrypted.data).toEqual(largeData);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const isValid = await cryptoService.verifyPassword(testPassword, encrypted.passwordHash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const isValid = await cryptoService.verifyPassword('WrongPassword', encrypted.passwordHash);
      
      expect(isValid).toBe(false);
    });

    it('should handle special characters in password verification', async () => {
      const specialPassword = 'Sp3c!@l#Pássw0rd🔐';
      const encrypted = await cryptoService.encryptData(testData, specialPassword);
      const isValid = await cryptoService.verifyPassword(specialPassword, encrypted.passwordHash);
      
      expect(isValid).toBe(true);
    });
  });

  describe('generateSalt', () => {
    it('should generate salt of default length', () => {
      const salt = cryptoService.generateSalt();
      
      expect(salt).toMatch(/^[0-9a-f]{64}$/);
      expect(salt).toHaveLength(64);
    });

    it('should generate salt of custom length', () => {
      const salt = cryptoService.generateSalt(16);
      
      expect(salt).toMatch(/^[0-9a-f]{32}$/);
      expect(salt).toHaveLength(32);
    });

    it('should generate different salts each time', () => {
      const salt1 = cryptoService.generateSalt();
      const salt2 = cryptoService.generateSalt();
      
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('generateIV', () => {
    it('should generate IV of default length', () => {
      const iv = cryptoService.generateIV();
      
      expect(iv).toBeInstanceOf(Buffer);
      expect(iv).toHaveLength(16);
    });

    it('should generate IV of custom length', () => {
      const iv = cryptoService.generateIV(12);
      
      expect(iv).toBeInstanceOf(Buffer);
      expect(iv).toHaveLength(12);
    });

    it('should generate different IVs each time', () => {
      const iv1 = cryptoService.generateIV();
      const iv2 = cryptoService.generateIV();
      
      expect(iv1.equals(iv2)).toBe(false);
    });
  });

  describe('Security Properties', () => {
    it('should detect tampering with authentication tag', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const parts = encrypted.encryptedData.split(':');
      const corruptedAuthTag = parts[2].replace(/.$/, '0');
      const tamperedData = `${parts[0]}:${parts[1]}:${corruptedAuthTag}`;
      
      expect(() =>
        cryptoService.decryptData(tamperedData, encrypted.salt, testPassword)
      ).toThrow(UnauthenticatedError);
    });

    it('should detect tampering with encrypted data', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      const parts = encrypted.encryptedData.split(':');
      const corruptedEncrypted = parts[1].replace(/.$/, '0');
      const tamperedData = `${parts[0]}:${corruptedEncrypted}:${parts[2]}`;
      
      expect(() =>
        cryptoService.decryptData(tamperedData, encrypted.salt, testPassword)
      ).toThrow(UnauthenticatedError);
    });

    it('should use strong password hashing (bcrypt)', async () => {
      const encrypted = await cryptoService.encryptData(testData, testPassword);
      
      expect(encrypted.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);
      expect(encrypted.passwordHash.length).toBeGreaterThan(50);
      expect(encrypted.passwordHash.length).toBeLessThan(70);
    });
  });
});
