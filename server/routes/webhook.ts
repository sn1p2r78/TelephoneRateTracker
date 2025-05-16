import { Router, Request, Response, NextFunction } from "express";
import { 
  processIncomingSms, 
  processIncomingCall, 
  processCallStatus, 
  processDlrStatus,
  processVoiceCallGet
} from "../integrations/http";
import { log } from "../vite";
import { storage } from "../storage";
import { validateApiKey, validateWebhookSignature, hashIp } from "../lib/security";

// Create a router for webhook endpoints
const webhookRouter = Router();

// Middleware to log all webhook requests and apply basic security
webhookRouter.use((req, res, next) => {
  // Log the request with IP hashing for privacy
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const hashedIp = hashIp(clientIp);
  log(`Webhook request from ${hashedIp}: ${req.method} ${req.url}`, 'webhook');
  next();
});

// Add webhook signature validation for providers that support it
webhookRouter.use(validateWebhookSignature);

// In development mode, don't require API keys
if (process.env.NODE_ENV !== 'production') {
  // Skip API key validation in development
  log('API key validation disabled in development mode', 'security');
} else {
  // Apply API key validation to all webhook routes in production
  webhookRouter.use(validateApiKey('webhook:access'));
}

// SMS Webhooks

// Handle incoming SMS messages
webhookRouter.post('/sms/incoming', processIncomingSms);

// Handle delivery receipts
webhookRouter.post('/sms/dlr', processDlrStatus);

// CDIR: Handle incoming SMS messages via GET (for providers that don't support POST)
// Format: /api/webhooks/sms?number=123456789&datetime=2025-05-15 03:59&text=Hello
webhookRouter.get('/sms', async (req, res) => {
  try {
    const { number, datetime, text } = req.query;
    
    if (!number || !text) {
      return res.status(400).json({ error: "Missing required parameters: number, text" });
    }
    
    log(`CDIR SMS received via GET: number=${number}, text=${text}`, 'webhook');
    
    // Create message history record
    const phoneNumber = number.toString();
    const messageText = text.toString();
    
    // Save to message history
    const messageHistory = await storage.createMessageHistory({
      phoneNumber,
      messageText,
      timestamp: datetime ? new Date(datetime.toString()) : new Date(),
      isProcessed: false,
      responseText: null,
      responseTimestamp: null
    });
    
    // Find matching auto-responders for this number
    const autoResponders = await storage.getMatchingAutoResponders(0, messageText); // 0 = all numbers
    
    if (autoResponders && autoResponders.length > 0) {
      // Use the first matching auto-responder
      const responder = autoResponders[0];
      
      // Update the message with a response
      // In a real scenario, you would send the SMS here as well
      await storage.updateMessageResponse(
        messageHistory.id, 
        responder.responseMessage
      );
      
      log(`Auto-response sent for message: ${responder.responseMessage}`, 'webhook');
    }
    
    res.status(200).json({ success: true, message: "Message received" });
  } catch (error: any) {
    log(`Error processing SMS webhook via GET: ${error.message}`, 'webhook');
    res.status(500).json({ error: error.message });
  }
});

// Voice Webhooks

// Log all voice webhooks for audit purposes
webhookRouter.use('/voice', (req, _res, next) => {
  const method = req.method;
  const endpoint = req.path;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const hashedIp = hashIp(clientIp);
  
  log(`VOICE WEBHOOK [${method}] ${endpoint} from IP ${hashedIp}`, 'audit');
  next();
});

// Handle incoming calls
webhookRouter.post('/voice/incoming', processIncomingCall);

// Handle call status updates
webhookRouter.post('/voice/status', processCallStatus);

// Handle voice calls via GET for easy integration
// Format: /api/webhooks/voice?caller_id=123456789&number=987654321&duration=60&timestamp=2025-05-15 12:45:00
webhookRouter.get('/voice', processVoiceCallGet);

// Generic webhook for any provider
// This endpoint allows any provider to use different parameters, and we'll parse them based on the 'provider' field
webhookRouter.post('/generic', async (req, res) => {
  const { provider, event } = req.body;
  
  if (!provider || !event) {
    return res.status(400).json({ error: "Missing required parameters: provider, event" });
  }
  
  log(`Generic webhook hit for provider: ${provider}, event: ${event}`, 'webhook');
  
  try {
    switch (event) {
      case 'incoming_sms':
        return await processIncomingSms(req, res);
      
      case 'dlr_status':
        return await processDlrStatus(req, res);
      
      case 'incoming_call':
        return await processIncomingCall(req, res);
      
      case 'call_status':
        return await processCallStatus(req, res);
      
      default:
        return res.status(400).json({ error: `Unknown event type: ${event}` });
    }
  } catch (error: any) {
    log(`Error processing webhook: ${error.message}`, 'webhook');
    return res.status(500).json({ error: error.message });
  }
});

// Add documentation for each endpoint in options response
webhookRouter.options('*', (req, res) => {
  const basePath = req.baseUrl;
  const availableEndpoints = {
    [`${basePath}/sms`]: {
      methods: ['GET'],
      description: 'Send SMS messages to the system via HTTP GET webhooks',
      parameters: {
        number: 'Required. The phone number sending the SMS',
        text: 'Required. The content of the SMS message',
        datetime: 'Optional. The timestamp of the message (defaults to current time)'
      }
    },
    [`${basePath}/sms/incoming`]: {
      methods: ['POST'],
      description: 'Send incoming SMS notifications via HTTP POST',
      body: {
        from: 'Required. The phone number sending the SMS',
        to: 'Required. The recipient phone number',
        text: 'Required. The content of the SMS message',
        provider: 'Optional. The provider name sending the webhook',
        timestamp: 'Optional. The timestamp of the message (ISO format)'
      }
    },
    [`${basePath}/voice`]: {
      methods: ['GET'],
      description: 'Send voice call notifications via HTTP GET webhooks',
      parameters: {
        caller_id: 'Required. The caller\'s phone number',
        number: 'Required. The phone number receiving the call',
        duration: 'Optional. Call duration in seconds (if completed)',
        timestamp: 'Optional. The timestamp of the call (defaults to current time)'
      }
    },
    [`${basePath}/voice/incoming`]: {
      methods: ['POST'],
      description: 'Send incoming call notifications via HTTP POST',
      body: {
        from: 'Required. The caller\'s phone number',
        to: 'Required. The recipient phone number',
        callId: 'Required. Unique ID for the call',
        timestamp: 'Optional. The timestamp of the call (ISO format)'
      }
    },
    [`${basePath}/generic`]: {
      methods: ['POST'],
      description: 'Universal webhook for different provider integrations',
      body: {
        provider: 'Required. The provider name (e.g., twilio, infobip)',
        event: 'Required. Event type (incoming_call, incoming_sms, call_status, dlr_status)',
        '[Additional fields]': 'Depends on the event type'
      }
    }
  };
  
  res.status(200).json({
    name: 'IPRN Management System Webhook API',
    version: '1.0.0',
    description: 'Webhook endpoints for telecom service integration',
    documentation: 'Available at /api-docs',
    endpoints: availableEndpoints,
    security: {
      apiKey: {
        name: 'x-api-key',
        in: process.env.NODE_ENV === 'production' ? 'header or query (api_key)' : 'optional in development'
      },
      signature: 'Some providers support webhook signatures for additional security'
    }
  });
});

// Catch 404 for unknown webhook endpoints
webhookRouter.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Unknown webhook endpoint: ${req.method} ${req.path}`,
      code: 'WEBHOOK_NOT_FOUND'
    },
    documentation: '/api/webhooks'
  });
});

export default webhookRouter;