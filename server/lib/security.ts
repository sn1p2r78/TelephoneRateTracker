import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { log } from '../vite';

// Environment checks
const isProduction = process.env.NODE_ENV === 'production';
const API_KEY_HEADER = 'X-API-Key';
const API_SECRET = process.env.API_SECRET || 'super-secure-development-secret';

/**
 * Validates the API key present in the request
 * Keys can be provided in multiple ways:
 * 1. As a header: X-API-Key
 * 2. As a query parameter: api_key
 * 3. As a body parameter: apiKey
 */
export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  // Skip validation in development mode unless explicitly enabled
  if (!isProduction && !process.env.ENFORCE_API_KEY_IN_DEV) {
    log('API key validation disabled in development mode', 'security');
    return next();
  }

  try {
    // Get API key from different possible sources
    const apiKey = 
      req.headers[API_KEY_HEADER.toLowerCase()] as string || 
      req.query.api_key as string || 
      req.body?.apiKey;

    if (!apiKey) {
      log('API key missing', 'security');
      return res.status(401).json({ error: 'API key required' });
    }

    // Check if key exists in database
    const setting = await storage.getSettingByKey('api_keys');
    
    if (!setting || !setting.value) {
      log('No API keys defined in the system', 'security');
      return res.status(500).json({ error: 'API key validation system not configured' });
    }

    // Parse the stored API keys
    let storedKeys: Array<{key: string, name: string, permissions: string[]}> = [];
    
    try {
      storedKeys = JSON.parse(setting.value);
    } catch (e) {
      log('Invalid API key storage format', 'security');
      return res.status(500).json({ error: 'API key storage format invalid' });
    }

    // Find the provided key in our stored keys
    const keyMatch = storedKeys.find(k => k.key === apiKey);
    
    if (!keyMatch) {
      log('Invalid API key provided', 'security');
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Add API key info to request for potential later use
    (req as any).apiKeyInfo = {
      name: keyMatch.name,
      permissions: keyMatch.permissions
    };
    
    log(`API key validated for: ${keyMatch.name}`, 'security');
    return next();
  } catch (error) {
    log(`API key validation error: ${error instanceof Error ? error.message : String(error)}`, 'security');
    return res.status(500).json({ error: 'Error validating API key' });
  }
}

/**
 * Generates an HMAC signature for webhook validation
 */
export function generateWebhookSignature(payload: string, secret = API_SECRET): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Validates a webhook signature
 */
export function validateWebhookSignature(
  payload: string, 
  signature: string,
  secret = API_SECRET
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Anonymizes an IP address for privacy protection
 * Converts the last octet of IPv4 or last 80 bits of IPv6 to zeros
 */
export function anonymizeIp(ip: string): string {
  // Handle IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[3] = '0'; // Zero out last octet
    return parts.join('.');
  } 
  // Handle IPv6
  else if (ip.includes(':')) {
    const parts = ip.split(':');
    // Zero out last 5 segments (80 bits)
    const anonymized = parts.slice(0, 3).concat(Array(5).fill('0000'));
    return anonymized.join(':');
  }
  
  // Invalid IP format
  return 'unknown';
}

/**
 * Calculate a hash of an IP address for more secure storage
 */
export function hashIpAddress(ip: string, salt = API_SECRET): string {
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex');
}

/**
 * Middleware to validate webhook signatures
 */
export function validateWebhook(req: Request, res: Response, next: NextFunction) {
  // Skip validation in development mode unless explicitly enabled
  if (!isProduction && !process.env.ENFORCE_WEBHOOK_SIG_IN_DEV) {
    return next();
  }

  try {
    const signature = req.headers['x-webhook-signature'] as string;
    
    if (!signature) {
      return res.status(401).json({ error: 'Webhook signature required' });
    }
    
    // For GET requests, use the query string as the payload
    // For POST requests, use the request body
    let payload: string;
    
    if (req.method === 'GET') {
      payload = JSON.stringify(req.query);
    } else {
      payload = JSON.stringify(req.body);
    }
    
    if (!validateWebhookSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error validating webhook signature' });
  }
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create or update an API key in the database
 */
export async function createApiKey(name: string, permissions: string[] = ['webhooks']): Promise<string> {
  try {
    const newKey = generateApiKey();
    
    // Get existing keys
    const setting = await storage.getSettingByKey('api_keys');
    let keys = [];
    
    if (setting && setting.value) {
      try {
        keys = JSON.parse(setting.value);
      } catch (e) {
        keys = [];
      }
    }
    
    // Add the new key
    keys.push({
      key: newKey,
      name,
      permissions,
      created: new Date().toISOString()
    });
    
    // Save the updated keys
    if (setting) {
      await storage.updateSetting(setting.id, {
        key: 'api_keys',
        value: JSON.stringify(keys),
        category: 'security',
        description: 'API keys for system access'
      });
    } else {
      await storage.createSetting({
        key: 'api_keys',
        value: JSON.stringify(keys),
        category: 'security',
        description: 'API keys for system access'
      });
    }
    
    return newKey;
  } catch (error) {
    log(`Error creating API key: ${error instanceof Error ? error.message : String(error)}`, 'security');
    throw new Error('Failed to create API key');
  }
}

/**
 * Delete an API key from the database
 */
export async function deleteApiKey(keyToDelete: string): Promise<boolean> {
  try {
    // Get existing keys
    const setting = await storage.getSettingByKey('api_keys');
    if (!setting || !setting.value) {
      return false;
    }
    
    let keys = [];
    try {
      keys = JSON.parse(setting.value);
    } catch (e) {
      return false;
    }
    
    // Remove the key
    const filteredKeys = keys.filter((k: any) => k.key !== keyToDelete);
    
    if (filteredKeys.length === keys.length) {
      // Key not found
      return false;
    }
    
    // Save the updated keys
    await storage.updateSetting(setting.id, {
      key: 'api_keys',
      value: JSON.stringify(filteredKeys),
      category: 'security',
      description: 'API keys for system access'
    });
    
    return true;
  } catch (error) {
    log(`Error deleting API key: ${error instanceof Error ? error.message : String(error)}`, 'security');
    return false;
  }
}