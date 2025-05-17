import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  insertNumberSchema, 
  insertCallLogSchema, 
  insertSMSLogSchema, 
  insertUserMessageSchema,
  insertApiIntegrationSchema,
  insertSettingSchema,
  insertProviderSchema,
  insertPayoutSchema,
  insertSmsAutoResponderSchema,
  users,
  providers,
  payouts,
  smsAutoResponders,
} from "@shared/schema";
import webhookRouter from "./routes/webhook";
import apiKeyRouter from "./routes/api-keys";
import { initializeIntegrations, getIntegrationsStatus } from "./integrations";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up webhooks routes
  app.use('/api/webhooks', webhookRouter);
  app.use('/api/api-keys', apiKeyRouter);
  
  // Initialize integrations (SMPP, HTTP, etc.)
  await initializeIntegrations();

  // Premium Number Routes
  app.get("/api/numbers", async (req: Request, res: Response) => {
    try {
      const numbers = await storage.getAllNumbers();
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/numbers", async (req: Request, res: Response) => {
    try {
      const parsed = insertNumberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid number data" });
      }
      const number = await storage.createNumber(parsed.data);
      res.status(201).json(number);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/numbers/:id", async (req: Request, res: Response) => {
    try {
      const number = await storage.getNumber(parseInt(req.params.id));
      if (!number) {
        return res.status(404).json({ message: "Number not found" });
      }
      res.json(number);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.put("/api/numbers/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertNumberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid number data" });
      }
      const updated = await storage.updateNumber(parseInt(req.params.id), parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Number not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Call Logs Routes
  app.get("/api/call-logs", async (req: Request, res: Response) => {
    try {
      const callLogs = await storage.getAllCallLogs();
      res.json(callLogs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/call-logs", async (req: Request, res: Response) => {
    try {
      const parsed = insertCallLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid call log data" });
      }
      const callLog = await storage.createCallLog(parsed.data);
      res.status(201).json(callLog);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // SMS Logs Routes
  app.get("/api/sms-logs", async (req: Request, res: Response) => {
    try {
      const smsLogs = await storage.getAllSMSLogs();
      res.json(smsLogs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/sms-logs", async (req: Request, res: Response) => {
    try {
      const parsed = insertSMSLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid SMS log data" });
      }
      const smsLog = await storage.createSMSLog(parsed.data);
      res.status(201).json(smsLog);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // User Messages Routes
  app.get("/api/user-messages", async (req: Request, res: Response) => {
    try {
      const userMessages = await storage.getAllUserMessages();
      res.json(userMessages);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/user-messages", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid user message data" });
      }
      const userMessage = await storage.createUserMessage(parsed.data);
      res.status(201).json(userMessage);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.put("/api/user-messages/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid user message data" });
      }
      const updated = await storage.updateUserMessage(parseInt(req.params.id), parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "User message not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // API Integrations Routes
  app.get("/api/integrations", async (req: Request, res: Response) => {
    try {
      const integrations = await storage.getAllApiIntegrations();
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/integrations", async (req: Request, res: Response) => {
    try {
      const parsed = insertApiIntegrationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid API integration data" });
      }
      const apiIntegration = await storage.createApiIntegration(parsed.data);
      
      // Initialize the new integration
      await initializeIntegrations();
      
      res.status(201).json(apiIntegration);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/integrations/status", async (req: Request, res: Response) => {
    try {
      const status = await getIntegrationsStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/integrations/:id/connect", async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getApiIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Connect to the integration
      if (integration.integrationType === 'smpp') {
        const { smppManager } = await import('./integrations/smpp');
        const connection = smppManager.initConnection(integration);
        const success = await connection.connect();
        
        if (success) {
          res.json({ message: "Connected successfully", status: "connected" });
        } else {
          res.status(500).json({ message: "Failed to connect", status: connection.status });
        }
      } else {
        res.json({ message: "No connection needed for this integration type" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/integrations/:id/disconnect", async (req: Request, res: Response) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getApiIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Disconnect from the integration
      if (integration.integrationType === 'smpp') {
        const { smppManager } = await import('./integrations/smpp');
        const connection = smppManager.getConnection(integrationId);
        
        if (connection) {
          await connection.disconnect();
          res.json({ message: "Disconnected successfully", status: "disconnected" });
        } else {
          res.status(404).json({ message: "No active connection found" });
        }
      } else {
        res.json({ message: "No connection to disconnect for this integration type" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Settings Routes
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const parsed = insertSettingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid setting data" });
      }
      const setting = await storage.createSetting(parsed.data);
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.put("/api/settings/:id", async (req: Request, res: Response) => {
    try {
      const parsed = insertSettingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid setting data" });
      }
      const updated = await storage.updateSetting(parseInt(req.params.id), parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // SMS Auto-responders Routes
  app.get("/api/auto-responders", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const autoResponders = await storage.getAllAutoResponders();
      res.json(autoResponders);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/auto-responders/number/:numberId", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const numberId = parseInt(req.params.numberId);
      if (isNaN(numberId)) {
        return res.status(400).json({ message: "Invalid number ID" });
      }
      
      const autoResponders = await storage.getAutoRespondersByNumber(numberId);
      res.json(autoResponders);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/auto-responders/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid auto-responder ID" });
      }
      
      const autoResponder = await storage.getAutoResponder(id);
      if (!autoResponder) {
        return res.status(404).json({ message: "Auto-responder not found" });
      }
      
      res.json(autoResponder);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/auto-responders", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const parsed = insertSmsAutoResponderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid auto-responder data", errors: parsed.error.format() });
      }
      
      const autoResponder = await storage.createAutoResponder(parsed.data);
      res.status(201).json(autoResponder);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.put("/api/auto-responders/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid auto-responder ID" });
      }
      
      const parsed = insertSmsAutoResponderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid auto-responder data", errors: parsed.error.format() });
      }
      
      const updated = await storage.updateAutoResponder(id, parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Auto-responder not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.delete("/api/auto-responders/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid auto-responder ID" });
      }
      
      const success = await storage.deleteAutoResponder(id);
      if (!success) {
        return res.status(404).json({ message: "Auto-responder not found or could not be deleted" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Test endpoint for SMS responder matching
  app.post("/api/auto-responders/test", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { numberId, message } = req.body;
      
      if (!numberId || typeof numberId !== 'number') {
        return res.status(400).json({ message: "Invalid number ID" });
      }
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message" });
      }
      
      const matchingResponders = await storage.getMatchingAutoResponders(numberId, message);
      res.json({
        message,
        numberId,
        matchCount: matchingResponders.length,
        matches: matchingResponders,
        response: matchingResponders.length > 0 ? matchingResponders[0].responseMessage : null
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Message History (CDIR) Routes
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const messages = await storage.getAllMessageHistory();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/messages/number/:phoneNumber", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { phoneNumber } = req.params;
      const messages = await storage.getMessageHistoryByNumber(phoneNumber);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Endpoint to receive messages via GET (for easy testing)
  app.get("/api/sms-webhook", async (req: Request, res: Response) => {
    try {
      const { number, datetime, text } = req.query;
      
      if (!number || !text) {
        return res.status(400).json({ 
          message: "Missing required parameters", 
          requiredFormat: "/api/sms-webhook?number=123456789&datetime=YYYY-MM-DD HH:MM&text=YourMessage"
        });
      }
      
      let timestamp: Date;
      if (datetime) {
        timestamp = new Date(datetime as string);
        if (isNaN(timestamp.getTime())) {
          timestamp = new Date(); // Use current time if parsing fails
        }
      } else {
        timestamp = new Date();
      }
      
      const messageData = {
        phoneNumber: number as string,
        messageText: text as string,
        timestamp
      };
      
      // Create the message history entry
      const message = await storage.createMessageHistory(messageData);
      
      // Return the response, including any auto-response if applicable
      res.json({
        success: true,
        message: "Message received successfully",
        data: message
      });
    } catch (error) {
      console.error("Error processing message webhook:", error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Provider routes
  app.get("/api/providers", async (req: Request, res: Response) => {
    try {
      const providerList = await db.select().from(providers);
      res.json(providerList);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/providers", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const providerData = insertProviderSchema.parse(req.body);
      const [provider] = await db.insert(providers).values(providerData).returning();
      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Payout routes
  app.get("/api/payouts", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userPayouts = await db
        .select()
        .from(payouts)
        .where(eq(payouts.userId, req.user.id))
        .orderBy(desc(payouts.requestedAt));
      
      res.json(userPayouts);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/payouts", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { amount, paymentMethod } = req.body;
      
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Check if user has sufficient balance
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id));
      
      if (!user || !user.balance || user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create payout request
      const [payout] = await db
        .insert(payouts)
        .values({
          userId: req.user.id,
          amount,
          paymentMethod,
          status: "pending"
        })
        .returning();
      
      // Update user balance
      const newBalance = user.balance ? user.balance - amount : 0;
      await db
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, req.user.id));
      
      res.status(201).json(payout);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // User payment settings update
  app.put("/api/user/payment-settings", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updateData: Record<string, any> = {};
      
      // Only allow updating payment-related fields
      const allowedFields = [
        "paymentMethod", "bankAccountNumber", "bankName", 
        "bankRoutingNumber", "usdtAddress"
      ];
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, req.user.id))
        .returning();
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Dashboard Analytics
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      // Use basic metrics or simulate data for dashboard
      // In a real system, these would be queried from actual database tables
      const mockData = {
        totalRevenue: 15000,
        callMinutes: 2500,
        smsCount: 12000,
        activeNumbers: 25,
        recentActivity: [
          {
            id: 1, 
            activityType: 'call',
            numberValue: '+447123456789',
            timestamp: new Date(),
            duration: 120,
            revenue: 45,
          },
          {
            id: 2,
            activityType: 'sms',
            numberValue: '+447123456790',
            timestamp: new Date(),
            revenue: 12,
          }
        ],
        topCountries: [
          { country: 'UK', revenue: 5000 },
          { country: 'US', revenue: 3500 },
          { country: 'Germany', revenue: 2500 },
        ],
        servicePerformance: [
          { 
            name: 'Premium Support', 
            type: 'voice', 
            revenue: 7500, 
            performance: 'up', 
            change: 15,
            usage: 7500 
          },
          { 
            name: 'Entertainment', 
            type: 'sms', 
            revenue: 4500, 
            performance: 'up', 
            change: 8,
            usage: 9200 
          },
          { 
            name: 'Premium Content', 
            type: 'combined', 
            revenue: 3000, 
            performance: 'down', 
            change: -3,
            usage: 4800 
          }
        ]
      };
      
      res.json(mockData);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Create http server
  const httpServer = createServer(app);

  return httpServer;
}
