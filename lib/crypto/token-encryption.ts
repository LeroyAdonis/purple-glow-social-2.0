import crypto from 'crypto';
import { logger } from '@/lib/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is not set');
  }
  if (key.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 64 characters (32 bytes hex)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a token using AES-256-GCM
 * @param token - The plain text token to encrypt
 * @returns Encrypted token as hex string (format: iv:authTag:salt:encrypted)
 */
export function encryptToken(token: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:salt:encrypted
    return [
      iv.toString('hex'),
      authTag.toString('hex'),
      salt.toString('hex'),
      encrypted
    ].join(':');
  } catch (error) {
    logger.security.exception(error, { action: 'token-encryption' });
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt a token using AES-256-GCM
 * @param encryptedToken - The encrypted token string
 * @returns Decrypted plain text token
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedToken.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted token format');
    }
    
    const [ivHex, authTagHex, saltHex, encrypted] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.security.exception(error, { action: 'token-decryption' });
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Validate encryption key format
 */
export function validateEncryptionKey(): boolean {
  try {
    const key = process.env.TOKEN_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
      return false;
    }
    // Try to create a buffer to verify it's valid hex
    Buffer.from(key, 'hex');
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new encryption key (for setup only)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
