import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync
} from 'crypto';
import bcrypt from 'bcrypt';
import { UnauthenticatedError } from '#/errors/UnauthenticatedError';

export interface EncryptedData {
  encryptedData: string;
  salt: string;
  passwordHash: string;
}

export interface DecryptedData {
  data: Uint8Array;
}

export class CryptoService {
  private readonly SALT_ROUNDS = 12;
  private readonly PBKDF2_ITERATIONS = 100000;
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;
  private readonly ALGORITHM = 'aes-256-gcm' as const;

  /**
   * Encrypt data using password-based encryption with AES-256-GCM
   * 
   * Security features:
   * 1. Uses Buffer.from() to ensure consistent UTF-8 encoding
   * 2. Generates cryptographically secure random salt and IV
   * 3. Uses proper key derivation (PBKDF2) with high iteration count
   * 4. Clears sensitive buffers after use
   */
  public async encryptData(data: Uint8Array, password: string): Promise<EncryptedData> {
    const passwordBuffer = Buffer.from(password, 'utf8');
    const salt = randomBytes(32);
    const derivedKey = pbkdf2Sync(
      passwordBuffer, 
      salt, 
      this.PBKDF2_ITERATIONS, 
      this.KEY_LENGTH, 
      'sha256'
    );
    
    const dataBuffer = Buffer.from(data);
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, derivedKey, iv);
    const encrypted1 = cipher.update(dataBuffer);
    const encrypted2 = cipher.final();
    const encrypted = Buffer.concat([encrypted1, encrypted2]);
    const authTag = cipher.getAuthTag();
    const encryptedWithTag = iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + authTag.toString('hex');
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    
    passwordBuffer.fill(0);
    derivedKey.fill(0);
    dataBuffer.fill(0);
    
    return {
      encryptedData: encryptedWithTag,
      salt: salt.toString('hex'),
      passwordHash
    };
  }

  /**
   * Decrypt data using password-based decryption with AES-256-GCM
   */
  public decryptData(
    encryptedData: string,
    saltHex: string,
    password: string
  ): DecryptedData {
    let passwordBuffer: Buffer | undefined;
    let derivedKey: Buffer | undefined;
    let iv: Buffer | undefined;
    let encrypted: Buffer | undefined;
    let authTag: Buffer | undefined;
    let salt: Buffer | undefined;
    let decryptedData: Buffer | undefined;

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) 
        throw new Error('Invalid encrypted data format');

      iv = Buffer.from(parts[0], 'hex');
      encrypted = Buffer.from(parts[1], 'hex');
      authTag = Buffer.from(parts[2], 'hex');
      salt = Buffer.from(saltHex, 'hex');
      passwordBuffer = Buffer.from(password, 'utf8');
      derivedKey = pbkdf2Sync(
        passwordBuffer,
        salt,
        this.PBKDF2_ITERATIONS,
        this.KEY_LENGTH,
        'sha256'
      );

      const decipher = createDecipheriv(this.ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted1 = decipher.update(encrypted);
      const decrypted2 = decipher.final();
      decryptedData = Buffer.concat([decrypted1, decrypted2]);

      return {
        data: new Uint8Array(decryptedData)
      };
    } catch (error) {
      throw new UnauthenticatedError('Invalid password');
    } finally {
      passwordBuffer?.fill(0);
      derivedKey?.fill(0);
      iv?.fill(0);
      encrypted?.fill(0);
      authTag?.fill(0);
      salt?.fill(0);
      decryptedData?.fill(0);
    }
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a cryptographically secure random salt
   */
  public generateSalt(length: number = 32): string { // TODO: Maybe not used
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a cryptographically secure random IV
   */
  public generateIV(length: number = this.IV_LENGTH): Buffer { // TODO: Maybe not used
    return randomBytes(length);
  }
}
