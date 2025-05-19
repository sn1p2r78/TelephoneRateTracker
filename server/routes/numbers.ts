import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { log } from "../vite";
import { insertNumberRequestSchema } from "@shared/schema";

// Create a router for number management
const numberRouter = Router();

// Get all available numbers
numberRouter.get("/", async (req: Request, res: Response) => {
  try {
    const numbers = await storage.getAllNumbers();
    return res.json(numbers);
  } catch (error) {
    log(`Error getting numbers: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve numbers" });
  }
});

// Get a specific number by ID
numberRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid number ID" });
    }
    
    const number = await storage.getNumber(id);
    if (!number) {
      return res.status(404).json({ error: "Number not found" });
    }
    
    return res.json(number);
  } catch (error) {
    log(`Error getting number: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve number" });
  }
});

// Get numbers by country
numberRouter.get("/country/:countryCode", async (req: Request, res: Response) => {
  try {
    const countryCode = req.params.countryCode;
    const numbers = await storage.getNumbersByCountry(countryCode);
    return res.json(numbers);
  } catch (error) {
    log(`Error getting numbers by country: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve numbers by country" });
  }
});

// Get numbers by service type
numberRouter.get("/service/:serviceType", async (req: Request, res: Response) => {
  try {
    const serviceType = req.params.serviceType;
    const numbers = await storage.getNumbersByServiceType(serviceType);
    return res.json(numbers);
  } catch (error) {
    log(`Error getting numbers by service type: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve numbers by service type" });
  }
});

// Get user's number requests
numberRouter.get("/my-requests", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id;
    const requests = await storage.getUserNumberRequests(userId);
    return res.json(requests);
  } catch (error) {
    log(`Error getting user number requests: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve number requests" });
  }
});

// Get a specific number request
numberRouter.get("/requests/:id", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    
    const request = await storage.getNumberRequest(id);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    // Only allow users to view their own requests unless they're an admin
    if (request.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You don't have permission to view this request" });
    }
    
    return res.json(request);
  } catch (error) {
    log(`Error getting number request: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve number request" });
  }
});

// Create a new number request
numberRouter.post("/request", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Validate request body
    const parseResult = insertNumberRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: parseResult.error.issues 
      });
    }
    
    // Add the user ID and default status
    const requestData = {
      ...parseResult.data,
      userId: req.user.id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const request = await storage.createNumberRequest(requestData);
    return res.status(201).json(request);
  } catch (error) {
    log(`Error creating number request: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to create number request" });
  }
});

// Get all number requests (admin only)
numberRouter.get("/admin/requests", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const requests = await storage.getAllNumberRequests();
    return res.json(requests);
  } catch (error) {
    log(`Error getting all number requests: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve number requests" });
  }
});

// Update a number request status (admin only)
numberRouter.put("/admin/requests/:id", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    
    const { status, adminNotes } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    // Ensure status is valid
    if (!['pending', 'approved', 'rejected', 'fulfilled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const updateData = {
      status,
      adminNotes,
      updatedAt: new Date()
    };
    
    const updatedRequest = await storage.updateNumberRequest(id, updateData);
    
    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    return res.json(updatedRequest);
  } catch (error) {
    log(`Error updating number request: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to update number request" });
  }
});

export default numberRouter;