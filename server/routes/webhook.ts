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
import { validateApiKey, validateWebhookSignature, hashIpAddress as hashIp, anonymizeIp } from "../lib/security";

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

// Optional webhook signature validation for providers that support it
// Uses X-Webhook-Signature header to validate requests
webhookRouter.use((req, res, next) => {
  // Only validate if the header is present
  const signature = req.headers['x-webhook-signature'];
  if (signature) {
    // Get the payload to validate (query params or body)
    const payload = req.method === 'GET' 
      ? JSON.stringify(req.query) 
      : JSON.stringify(req.body);
    
    // Validate the signature
    if (!validateWebhookSignature(payload, signature as string)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
  }
  
  // Continue to next middleware
  next();
});

// In development mode, don't require API keys by default
if (process.env.NODE_ENV === 'development' && !process.env.ENFORCE_API_KEY_IN_DEV) {
  // Skip API key validation in development
  log('API key validation disabled in development mode', 'security');
} else {
  // Apply API key validation to all webhook routes in production
  webhookRouter.use((req, res, next) => validateApiKey(req, res, next));
}

// SMS Webhooks

// Handle incoming SMS messages
webhookRouter.post('/sms/incoming', processIncomingSms);

// Handle delivery receipts
webhookRouter.post('/sms/dlr', processDlrStatus);

// CDIR: Handle incoming SMS messages via GET
// Multiple formats supported:
// 1. Send new message: /api/webhooks/sms?number=123456789&datetime=2025-05-15 03:59&text=Hello
// 2. Query messages: /api/webhooks/sms?number=123456789&start_date=2025-05-01&end_date=2025-05-15
webhookRouter.get('/sms', async (req, res) => {
  try {
    const { number, datetime, text, start_date, end_date, limit } = req.query;
    
    // CASE 1: Message retrieval mode (has number + date range)
    if (number && (start_date || end_date)) {
      log(`SMS history query: number=${number}, date range=${start_date || 'any'} to ${end_date || 'any'}`, 'webhook');
      
      const phoneNumber = number.toString();
      const maxLimit = parseInt(limit?.toString() || '100');
      
      // Parse date range or use defaults
      const startDateTime = start_date ? new Date(start_date.toString()) : new Date(0); // 1970 if not specified
      const endDateTime = end_date ? new Date(end_date.toString()) : new Date(); // Current time if not specified
      
      // Get message history for the specified number and date range
      const messages = await storage.getMessageHistoryByNumber(phoneNumber);
      
      // Filter by date range and apply limit
      const filteredMessages = messages
        .filter(msg => {
          // Handle potential null timestamps gracefully
          if (!msg.timestamp) return false;
          const msgDate = new Date(msg.timestamp);
          return msgDate >= startDateTime && msgDate <= endDateTime;
        })
        .slice(0, maxLimit);
      
      return res.status(200).json({
        success: true,
        count: filteredMessages.length,
        date_range: {
          from: startDateTime.toISOString(),
          to: endDateTime.toISOString()
        },
        messages: filteredMessages
      });
    }
    
    // CASE 2: Send new message mode (has number + text)
    if (!number || !text) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        usage: {
          "send_message": "/api/webhooks/sms?number=123456789&text=Hello&datetime=optional_timestamp",
          "query_messages": "/api/webhooks/sms?number=123456789&start_date=2025-05-01&end_date=2025-05-15&limit=100"
        }
      });
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
    
    res.status(200).json({ 
      success: true, 
      message: "Message received",
      message_id: messageHistory.id,
      auto_response: autoResponders && autoResponders.length > 0
    });
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
// Multiple formats supported:
// 1. Send call data: /api/webhooks/voice?caller_id=123456789&number=987654321&duration=60&timestamp=2025-05-15 12:45:00
// 2. Query calls: /api/webhooks/voice?number=987654321&start_date=2025-05-01&end_date=2025-05-15&limit=50
webhookRouter.get('/voice', async (req, res) => {
  try {
    const { caller_id, number, duration, timestamp, start_date, end_date, limit } = req.query;
    
    // CASE 1: Call retrieval mode (has number + date range)
    if (number && (start_date || end_date) && !caller_id) {
      log(`Voice call history query: number=${number}, date range=${start_date || 'any'} to ${end_date || 'any'}`, 'webhook');
      
      const phoneNumber = number.toString();
      const maxLimit = parseInt(limit?.toString() || '50');
      
      // Parse date range or use defaults
      const startDateTime = start_date ? new Date(start_date.toString()) : new Date(0); // 1970 if not specified
      const endDateTime = end_date ? new Date(end_date.toString()) : new Date(); // Current time if not specified
      
      // Get call logs for the specified number
      const callLogs = await storage.getAllCallLogs();
      
      // Filter by number, date range and apply limit
      const filteredCalls = callLogs
        .filter(call => {
          // Handle potential null startTime gracefully
          if (!call.startTime) return false;
          
          const callStartTime = new Date(call.startTime);
          const numberMatches = call.numberValue === phoneNumber || call.caller === phoneNumber || call.recipient === phoneNumber;
          return numberMatches && (callStartTime >= startDateTime && callStartTime <= endDateTime);
        })
        .slice(0, maxLimit);
      
      return res.status(200).json({
        success: true,
        count: filteredCalls.length,
        date_range: {
          from: startDateTime.toISOString(),
          to: endDateTime.toISOString()
        },
        calls: filteredCalls
      });
    }
    
    // CASE 2: Send new call data (has caller_id + number)
    // Use the existing handler for processing voice calls
    return processVoiceCallGet(req, res);
  } catch (error: any) {
    log(`Error processing voice webhook via GET: ${error.message}`, 'webhook');
    res.status(500).json({ error: error.message });
  }
});

// Generic webhook with support for both POST and GET requests
// This endpoint allows any provider to use different parameters, and we'll parse them based on the 'provider' field
// It also supports querying historical data for specific providers

// GET version for easier integration
webhookRouter.get('/generic', async (req, res) => {
  try {
    const { provider, event, query, number, start_date, end_date, limit } = req.query;
    
    // Query mode
    if (provider && query === 'historical' && number) {
      log(`Generic historical query via GET: provider=${provider}, number=${number}`, 'webhook');
      
      const phoneNumber = String(number);
      const maxLimit = parseInt(String(limit || '100'));
      
      // Parse date range or use defaults
      const startDateTime = start_date ? new Date(String(start_date)) : new Date(0);
      const endDateTime = end_date ? new Date(String(end_date)) : new Date();
      
      let result: any = { success: true, provider };
      
      // Get data based on the provider and query type
      if (provider === 'sms' || provider === 'all') {
        const messages = await storage.getMessageHistoryByNumber(phoneNumber);
        const filteredMessages = messages
          .filter(msg => {
            if (!msg.timestamp) return false;
            const msgDate = new Date(msg.timestamp);
            return msgDate >= startDateTime && msgDate <= endDateTime;
          })
          .slice(0, maxLimit);
          
        result.sms_count = filteredMessages.length;
        result.sms_messages = filteredMessages;
      }
      
      if (provider === 'voice' || provider === 'all') {
        const callLogs = await storage.getAllCallLogs();
        const filteredCalls = callLogs
          .filter(call => {
            if (!call.startTime) return false;
            const callStartTime = new Date(call.startTime);
            const numberMatches = call.numberValue === phoneNumber || 
                                 call.caller === phoneNumber || 
                                 call.recipient === phoneNumber;
            return numberMatches && (callStartTime >= startDateTime && callStartTime <= endDateTime);
          })
          .slice(0, maxLimit);
          
        result.voice_count = filteredCalls.length;
        result.voice_calls = filteredCalls;
      }
      
      result.date_range = {
        from: startDateTime.toISOString(),
        to: endDateTime.toISOString()
      };
      
      return res.status(200).json(result);
    }
    
    // Regular webhook mode
    if (provider && event) {
      // Create a body object from query parameters to pass to the handlers
      const body: any = { ...req.query };
      req.body = body;
      
      switch (String(event)) {
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
    }
    
    // No valid parameters provided
    return res.status(400).json({ 
      error: "Missing required parameters", 
      usage: {
        "webhook_mode": "/api/webhooks/generic?provider=twilio&event=incoming_sms&from=123456789&to=987654321&text=Hello",
        "query_mode": "/api/webhooks/generic?provider=all&query=historical&number=123456789&start_date=2025-05-01&end_date=2025-05-15&limit=100"
      }
    });
    
  } catch (error: any) {
    log(`Error processing generic webhook via GET: ${error.message}`, 'webhook');
    return res.status(500).json({ error: error.message });
  }
});

// POST version for traditional webhook integrations
webhookRouter.post('/generic', async (req, res) => {
  const { provider, event, query, number, start_date, end_date, limit } = req.body;
  
  // CASE 1: Query historical data mode
  if (provider && query === 'historical' && number) {
    try {
      log(`Generic historical query for provider: ${provider}, number: ${number}`, 'webhook');
      
      const phoneNumber = number.toString();
      const maxLimit = parseInt(limit?.toString() || '100');
      
      // Parse date range or use defaults
      const startDateTime = start_date ? new Date(start_date.toString()) : new Date(0);
      const endDateTime = end_date ? new Date(end_date.toString()) : new Date();
      
      let result: any = { success: true, provider };
      
      // Get data based on the provider and query type
      if (provider === 'sms' || provider === 'all') {
        // Get SMS history
        const messages = await storage.getMessageHistoryByNumber(phoneNumber);
        
        // Filter by date range
        const filteredMessages = messages
          .filter(msg => {
            if (!msg.timestamp) return false;
            const msgDate = new Date(msg.timestamp);
            return msgDate >= startDateTime && msgDate <= endDateTime;
          })
          .slice(0, maxLimit);
          
        result.sms_count = filteredMessages.length;
        result.sms_messages = filteredMessages;
      }
      
      if (provider === 'voice' || provider === 'all') {
        // Get call logs
        const callLogs = await storage.getAllCallLogs();
        
        // Filter by number and date range
        const filteredCalls = callLogs
          .filter(call => {
            if (!call.startTime) return false;
            const callStartTime = new Date(call.startTime);
            const numberMatches = call.numberValue === phoneNumber || 
                                 call.caller === phoneNumber || 
                                 call.recipient === phoneNumber;
            return numberMatches && (callStartTime >= startDateTime && callStartTime <= endDateTime);
          })
          .slice(0, maxLimit);
          
        result.voice_count = filteredCalls.length;
        result.voice_calls = filteredCalls;
      }
      
      // Add date range info to result
      result.date_range = {
        from: startDateTime.toISOString(),
        to: endDateTime.toISOString()
      };
      
      return res.status(200).json(result);
    } catch (error: any) {
      log(`Error processing historical query: ${error.message}`, 'webhook');
      return res.status(500).json({ error: error.message });
    }
  }
  
  // CASE 2: Traditional webhook processing mode
  if (!provider || !event) {
    return res.status(400).json({ 
      error: "Missing required parameters", 
      usage: {
        "webhook_mode": { 
          provider: "Required. Provider name (e.g., twilio, infobip)",
          event: "Required. Event type (incoming_sms, incoming_call, etc.)"
        },
        "query_mode": {
          provider: "Required. Data type to query ('sms', 'voice', or 'all')",
          query: "Required. Set to 'historical' to query data",
          number: "Required. The phone number to query data for",
          start_date: "Optional. Start date for filtering data",
          end_date: "Optional. End date for filtering data",
          limit: "Optional. Maximum number of records to return" 
        }
      }
    });
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