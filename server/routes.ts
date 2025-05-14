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
  users,
  providers,
  payouts,
} from "@shared/schema";
import webhookRouter from "./routes/webhook";
import { initializeIntegrations, getIntegrationsStatus } from "./integrations";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up webhooks routes
  app.use('/api/webhooks', webhookRouter);
  
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
      
      if (!user || user.balance < amount) {
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
      await db
        .update(users)
        .set({ balance: user.balance - amount })
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
