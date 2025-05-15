import { Router } from "express";
import { 
  processIncomingSms, 
  processIncomingCall, 
  processCallStatus, 
  processDlrStatus,
  processVoiceCallGet
} from "../integrations/http";
import { log } from "../vite";
import { storage } from "../storage";

// Create a router for webhook endpoints
const webhookRouter = Router();

// Middleware to log all webhook requests
webhookRouter.use((req, res, next) => {
  log(`Webhook request: ${req.method} ${req.url}`, 'webhook');
  next();
});

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

export default webhookRouter;