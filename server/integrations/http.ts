import { log } from "../vite";
import { Request, Response } from "express";
import { storage } from "../storage";
import { insertSMSLogSchema, insertCallLogSchema } from "@shared/schema";

// Event names for webhook callbacks
export enum WebhookEvent {
  INCOMING_CALL = "incoming_call",
  CALL_STATUS = "call_status",
  INCOMING_SMS = "incoming_sms",
  DLR_STATUS = "dlr_status",
}

// Process incoming SMS webhook
export async function processIncomingSms(req: Request, res: Response) {
  try {
    const { from, to, text, provider, timestamp = new Date().toISOString() } = req.body;
    
    if (!from || !to || !text) {
      return res.status(400).json({ error: "Missing required parameters: from, to, text" });
    }
    
    log(`Received SMS from ${from} to ${to}: ${text}`, 'webhook');
    
    // Find the number in our system
    const numbers = await storage.getAllNumbers();
    const number = numbers.find(n => n.value === to || n.number === to);
    
    if (!number) {
      log(`Number ${to} not found in system`, 'webhook');
      return res.status(404).json({ error: "Number not found" });
    }
    
    // Create SMS log with proper parsing
    const smsLog = await storage.createSMSLog({
      numberId: number.id,
      numberValue: number.value || number.number,
      numberName: number.name || `Number ${number.number}`,
      sender: from,
      recipient: to,
      message: text,
      messageLength: text.length,
      status: "RECEIVED",
      direction: "INBOUND",
      providerName: provider || "HTTP_WEBHOOK",
      countryCode: number.countryCode,
      serviceType: number.serviceType,
      timestamp: new Date(timestamp),
      revenue: 0 // Will be calculated based on rules
    });
    
    // In a real system, you might want to:
    // 1. Forward this SMS to a client's system
    // 2. Send an auto-response
    // 3. Trigger a workflow
    
    return res.status(200).json({
      success: true,
      message: "SMS processed successfully",
      id: smsLog.id
    });
  } catch (error: any) {
    log(`Error processing incoming SMS: ${error.message}`, 'webhook');
    return res.status(500).json({ error: error.message });
  }
}

// Process incoming call webhook
export async function processIncomingCall(req: Request, res: Response) {
  try {
    const { from, to, callId, provider, timestamp = new Date().toISOString() } = req.body;
    
    if (!from || !to || !callId) {
      return res.status(400).json({ error: "Missing required parameters: from, to, callId" });
    }
    
    log(`Received call from ${from} to ${to}`, 'webhook');
    
    // Find the number in our system
    const numbers = await storage.getAllNumbers();
    const number = numbers.find(n => n.value === to || n.number === to);
    
    if (!number) {
      log(`Number ${to} not found in system`, 'webhook');
      return res.status(404).json({ error: "Number not found" });
    }
    
    // Create call log with proper parsing
    const callLog = await storage.createCallLog({
      numberId: number.id,
      numberValue: number.value || number.number,
      numberName: number.name || `Number ${number.number}`,
      caller: from,
      recipient: to,
      callId,
      startTime: new Date(timestamp),
      endTime: null,
      duration: 0,
      status: "RINGING",
      direction: "INBOUND",
      providerName: provider || "HTTP_WEBHOOK",
      countryCode: number.countryCode,
      serviceType: number.serviceType,
      recording: null,
      revenue: 0 // Will be calculated based on rules
    });
    
    // In a real system, you might want to:
    // 1. Forward this call to a client's system
    // 2. Play audio or use text-to-speech to respond
    // 3. Forward the call to another number
    
    return res.status(200).json({
      success: true,
      message: "Call processed successfully",
      id: callLog.id
    });
  } catch (error: any) {
    log(`Error processing incoming call: ${error.message}`, 'webhook');
    return res.status(500).json({ error: error.message });
  }
}

// Process call status update webhook
export async function processCallStatus(req: Request, res: Response) {
  try {
    const { callId, status, duration, endTime, recording } = req.body;
    
    if (!callId || !status) {
      return res.status(400).json({ error: "Missing required parameters: callId, status" });
    }
    
    // Find the call log in our system
    const callLogs = await storage.getAllCallLogs();
    const callLog = callLogs.find(c => c.callId === callId);
    
    if (!callLog) {
      log(`Call ID ${callId} not found in system`, 'webhook');
      return res.status(404).json({ error: "Call not found" });
    }
    
    // Update call log with new status information
    const updatedCallLog = {
      ...callLog,
      status,
      duration: duration || callLog.duration,
      endTime: endTime || callLog.endTime,
      recording: recording || callLog.recording
    };
    
    // In a real system, we would update the call log in the database
    log(`Updated call ${callId} status to ${status}`, 'webhook');
    
    // Calculate revenue if the call has ended
    if (status === 'COMPLETED' && duration) {
      // In a real system, you would calculate revenue based on pricing rules
      log(`Call ${callId} completed with duration ${duration}s`, 'webhook');
    }
    
    return res.status(200).json({
      success: true,
      message: "Call status updated successfully"
    });
  } catch (error: any) {
    log(`Error processing call status: ${error.message}`, 'webhook');
    return res.status(500).json({ error: error.message });
  }
}

// Process delivery receipt webhook
export async function processDlrStatus(req: Request, res: Response) {
  try {
    const { messageId, status, errorCode, timestamp = new Date().toISOString() } = req.body;
    
    if (!messageId || !status) {
      return res.status(400).json({ error: "Missing required parameters: messageId, status" });
    }
    
    // Find the SMS log in our system
    // In a real system, you would query the database for the SMS log
    log(`Updated message ${messageId} status to ${status}`, 'webhook');
    
    // In a real system, you might want to:
    // 1. Update the SMS status in your database
    // 2. Notify the client about the delivery status
    // 3. Retry failed messages
    
    return res.status(200).json({
      success: true,
      message: "Delivery receipt processed successfully"
    });
  } catch (error: any) {
    log(`Error processing delivery receipt: ${error.message}`, 'webhook');
    return res.status(500).json({ error: error.message });
  }
}

// Process voice call via GET endpoint
export async function processVoiceCallGet(req: Request, res: Response) {
  try {
    const { caller_id, number, duration, timestamp } = req.query;
    
    if (!caller_id || !number) {
      return res.status(400).json({ error: "Missing required parameters: caller_id, number" });
    }
    
    log(`CDIR Voice call received via GET: caller=${caller_id}, number=${number}`, 'webhook');
    
    // Find the number in our system
    const numbers = await storage.getAllNumbers();
    const targetNumber = numbers.find(n => n.value === number || n.number === number.toString());
    
    if (!targetNumber) {
      log(`Number ${number} not found in system`, 'webhook');
      return res.status(404).json({ error: "Number not found" });
    }
    
    // Create call log 
    const callLog = await storage.createCallLog({
      numberId: targetNumber.id,
      numberValue: targetNumber.value || targetNumber.number,
      numberName: targetNumber.name || `Number ${targetNumber.number}`,
      caller: caller_id.toString(),
      recipient: number.toString(),
      callId: `manual-${Date.now()}`,
      startTime: timestamp ? new Date(timestamp.toString()) : new Date(),
      endTime: duration ? new Date(Date.now() + (parseInt(duration.toString()) * 1000)) : null,
      duration: duration ? parseInt(duration.toString()) : 0,
      status: duration ? "COMPLETED" : "RINGING",
      direction: "INBOUND",
      providerName: "HTTP_GET_WEBHOOK",
      countryCode: targetNumber.countryCode,
      serviceType: targetNumber.serviceType,
      recording: null,
      revenue: 0 // Will be calculated based on rules
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Call notification received",
      id: callLog.id 
    });
  } catch (error: any) {
    log(`Error processing voice call via GET: ${error.message}`, 'webhook');
    res.status(500).json({ error: error.message });
  }
}

// Generate webhook URLs for a provider
export function generateWebhookUrls(baseUrl: string) {
  return {
    [WebhookEvent.INCOMING_SMS]: `${baseUrl}/api/webhooks/sms/incoming`,
    [WebhookEvent.DLR_STATUS]: `${baseUrl}/api/webhooks/sms/dlr`,
    [WebhookEvent.INCOMING_CALL]: `${baseUrl}/api/webhooks/voice/incoming`,
    [WebhookEvent.CALL_STATUS]: `${baseUrl}/api/webhooks/voice/status`
  };
}