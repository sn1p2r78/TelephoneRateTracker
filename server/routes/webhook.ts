import { Router } from "express";
import { 
  processIncomingSms, 
  processIncomingCall, 
  processCallStatus, 
  processDlrStatus 
} from "../integrations/http";
import { log } from "../vite";

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

// Voice Webhooks

// Handle incoming calls
webhookRouter.post('/voice/incoming', processIncomingCall);

// Handle call status updates
webhookRouter.post('/voice/status', processCallStatus);

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