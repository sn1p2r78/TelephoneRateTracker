import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { log } from "../vite";

// Interface for API key configuration
interface ApiKeyConfig {
  name: string;
  value: string;
  permissions: string[];
  rateLimit?: {
    maxRequests: number;
    timeWindowMs: number;
  };
}

// Simple rate limiting for API keys
const rateLimiters: Record<string, { count: number; resetTime: number }> = {};

// In a real application, these would be stored in a database
// For this example, we'll use a hardcoded config, but you'd normally load this from env vars or DB
const API_KEYS: ApiKeyConfig[] = [
  {
    name: "webhook_key",
    value: process.env.WEBHOOK_API_KEY || "dev_webhook_key_iprn_system_2025", // In production, use a real API key
    permissions: ["webhook:*"],
    rateLimit: {
      maxRequests: 100,
      timeWindowMs: 60000 // 1 minute
    }
  },
  {
    name: "admin_key",
    value: process.env.ADMIN_API_KEY || "dev_admin_key_iprn_system_2025", // In production, use a real API key
    permissions: ["webhook:*", "admin:*"],
    rateLimit: {
      maxRequests: 300,
      timeWindowMs: 60000 // 1 minute
    }
  }
];

/**
 * Creates a middleware to validate API keys
 * @param requiredPermission - The permission required to access the resource
 */
export function validateApiKey(requiredPermission?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get API key from header or query parameter
    const apiKey = req.headers["x-api-key"] || req.query.api_key as string;
    
    // Skip validation if no permission is required (public endpoint) or in development mode
    if (!requiredPermission || process.env.NODE_ENV === "development" && !apiKey) {
      return next();
    }
    
    // If no API key provided
    if (!apiKey) {
      return res.status(401).json({ 
        error: { 
          message: "API key is required. Include it as an 'x-api-key' header or 'api_key' query parameter." 
        } 
      });
    }
    
    // Find the API key configuration
    const keyConfig = API_KEYS.find(k => k.value === apiKey);
    
    // If API key is invalid
    if (!keyConfig) {
      log(`Invalid API key attempt: ${maskApiKey(apiKey)}`, 'security');
      return res.status(401).json({ 
        error: { 
          message: "Invalid API key." 
        } 
      });
    }
    
    // Check permission
    if (requiredPermission && 
        !keyConfig.permissions.includes(requiredPermission) && 
        !keyConfig.permissions.includes(requiredPermission.split(':')[0] + ':*')) {
      log(`Permission denied for API key ${keyConfig.name}: ${requiredPermission}`, 'security');
      return res.status(403).json({ 
        error: { 
          message: "You don't have permission to access this resource." 
        } 
      });
    }
    
    // Check rate limit
    if (keyConfig.rateLimit) {
      const now = Date.now();
      const rateLimiter = rateLimiters[apiKey] || { count: 0, resetTime: now + keyConfig.rateLimit.timeWindowMs };
      
      // Reset if the time window has passed
      if (now > rateLimiter.resetTime) {
        rateLimiter.count = 0;
        rateLimiter.resetTime = now + keyConfig.rateLimit.timeWindowMs;
      }
      
      // Increment request count
      rateLimiter.count++;
      rateLimiters[apiKey] = rateLimiter;
      
      // Check if rate limit exceeded
      if (rateLimiter.count > keyConfig.rateLimit.maxRequests) {
        log(`Rate limit exceeded for API key ${keyConfig.name}`, 'security');
        return res.status(429).json({ 
          error: { 
            message: "Rate limit exceeded. Try again later." 
          } 
        });
      }
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', keyConfig.rateLimit.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (keyConfig.rateLimit.maxRequests - rateLimiter.count).toString());
      res.setHeader('X-RateLimit-Reset', Math.floor(rateLimiter.resetTime / 1000).toString());
    }
    
    // Add API key info to request for further reference
    (req as any).apiKey = {
      name: keyConfig.name,
      permissions: keyConfig.permissions
    };
    
    next();
  };
}

/**
 * Create a hash of an IP address to log it without revealing it completely
 */
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'iprn-salt').digest('hex').substring(0, 8);
}

/**
 * Mask an API key for logging (shows only first and last 4 characters)
 */
function maskApiKey(apiKey: string): string {
  if (apiKey.length < 8) return '****';
  return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
}

/**
 * Middleware to validate webhook signature from providers that support it
 */
export function validateWebhookSignature(req: Request, res: Response, next: NextFunction) {
  const provider = req.query.provider || req.body?.provider;
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;
  
  // Skip signature validation in development or if not provided
  if (process.env.NODE_ENV === "development" || !signature) {
    return next();
  }
  
  if (provider === 'twilio') {
    // Example for Twilio signature validation
    // In a real app, use the Twilio SDK's validateRequest function
    log(`Validating Twilio webhook signature`, 'security');
    // validateTwilioSignature(signature, req.url, req.body);
  } else if (provider === 'infobip') {
    // Example for Infobip or other provider validation
    log(`Validating ${provider} webhook signature`, 'security');
  }
  
  // For this example, we'll just pass through
  // In a real app, you would validate the signature and respond with 403 if invalid
  next();
}

/**
 * Generate a webhook token for secure webhooks
 */
export function generateWebhookToken(webhookId: string): string {
  // In a real app, you would use a proper key management system
  const secretKey = process.env.WEBHOOK_SECRET_KEY || "dev_webhook_secret_key";
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(webhookId);
  return hmac.digest('hex');
}