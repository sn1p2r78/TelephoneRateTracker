import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertNumberSchema, 
  insertCallLogSchema, 
  insertSMSLogSchema, 
  insertUserMessageSchema,
  insertApiIntegrationSchema,
  insertSettingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

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
      res.status(201).json(apiIntegration);
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

  // Dashboard Analytics
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const totalRevenue = await storage.getTotalRevenue();
      const callMinutes = await storage.getTotalCallMinutes();
      const smsCount = await storage.getTotalSMSCount();
      const activeNumbers = await storage.getActiveNumbersCount();
      const recentActivity = await storage.getRecentActivity();
      const topCountries = await storage.getTopPerformingCountries();
      const servicePerformance = await storage.getServicePerformance();
      
      res.json({
        totalRevenue,
        callMinutes,
        smsCount,
        activeNumbers,
        recentActivity,
        topCountries,
        servicePerformance
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Create http server
  const httpServer = createServer(app);

  return httpServer;
}
