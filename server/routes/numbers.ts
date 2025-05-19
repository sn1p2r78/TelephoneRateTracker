import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { log } from "../vite";
import { insertNumberSchema } from "@shared/schema";
import { z } from "zod";

// Create a router for number management
const numberRouter = Router();

// Import numbers from Excel
numberRouter.post("/import", async (req: Request, res: Response) => {
  try {
    const { numbers } = req.body;
    
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: "No valid numbers to import" });
    }
    
    // Define validation schema for imported numbers
    const importSchema = z.array(
      z.object({
        country: z.string().min(1, "Country is required"),
        number: z.string().min(1, "Number is required"),
        range: z.string().min(1, "Range is required"),
        provider: z.string().min(1, "Provider is required"),
        price: z.number().min(0.01, "Price must be greater than 0"),
      })
    );
    
    // Validate numbers
    const validationResult = importSchema.safeParse(numbers);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid number data", 
        details: validationResult.error.errors 
      });
    }
    
    const validNumbers = validationResult.data;
    const importedNumbers = [];
    
    // Import valid numbers
    for (const number of validNumbers) {
      try {
        // Transform imported number to match our schema
        const insertNumber = {
          name: `${number.range} - ${number.country}`,
          number: number.number,
          value: number.number, // Full format including country code
          countryCode: number.country,
          type: 'COMBINED', // Default to combined (voice + SMS)
          serviceType: number.range,
          ratePerMinute: Number(number.price),
          ratePerSMS: Number(number.price) / 2, // Default SMS rate
          isActive: true,
        };
        
        // Create number in database
        const createdNumber = await storage.createNumber(insertNumber);
        importedNumbers.push(createdNumber);
      } catch (error) {
        log(`Error importing number ${number.number}: ${error}`, "api");
        // Continue with next number if one fails
      }
    }
    
    return res.status(201).json({
      success: true,
      imported: importedNumbers.length,
      numbers: importedNumbers
    });
  } catch (error) {
    log(`Error importing numbers: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to import numbers" });
  }
});

// Get all numbers
numberRouter.get("/", async (req: Request, res: Response) => {
  try {
    const numbers = await storage.getAllNumbers();
    return res.json(numbers);
  } catch (error) {
    log(`Error getting numbers: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve numbers" });
  }
});

// Create a new number
numberRouter.post("/", async (req: Request, res: Response) => {
  try {
    const validation = insertNumberSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid number data", 
        details: validation.error.errors 
      });
    }
    
    const number = await storage.createNumber(validation.data);
    return res.status(201).json(number);
  } catch (error) {
    log(`Error creating number: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to create number" });
  }
});

// Request a number (for users)
numberRouter.post("/request", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { country, serviceType, quantity = 1 } = req.body;
    
    if (!country || !serviceType) {
      return res.status(400).json({ error: "Country and service type are required" });
    }
    
    // Create number request in database
    const numberRequest = await storage.createNumberRequest({
      userId: req.user.id,
      country,
      serviceType,
      quantity: Number(quantity),
      status: "pending",
      createdAt: new Date(),
      notes: req.body.notes || ""
    });
    
    return res.status(201).json({
      success: true,
      message: "Number request submitted successfully",
      request: numberRequest
    });
  } catch (error) {
    log(`Error requesting number: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to submit number request" });
  }
});

// Get all number requests (for admins)
numberRouter.get("/requests", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const requests = await storage.getAllNumberRequests();
    return res.json(requests);
  } catch (error) {
    log(`Error getting number requests: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve number requests" });
  }
});

// Get number requests for current user
numberRouter.get("/my-requests", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const requests = await storage.getUserNumberRequests(req.user.id);
    return res.json(requests);
  } catch (error) {
    log(`Error getting user number requests: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve number requests" });
  }
});

// Update number request status (for admins)
numberRouter.patch("/requests/:id", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const requestId = parseInt(req.params.id);
    const { status, notes, assignedNumbers } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    // Update request status
    const updatedRequest = await storage.updateNumberRequest(requestId, {
      status,
      notes: notes || undefined,
      assignedNumbers: assignedNumbers || undefined,
      updatedAt: new Date()
    });
    
    if (!updatedRequest) {
      return res.status(404).json({ error: "Number request not found" });
    }
    
    return res.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    log(`Error updating number request: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to update number request" });
  }
});

// Get numbers by country
numberRouter.get("/country/:country", async (req: Request, res: Response) => {
  try {
    const country = req.params.country;
    
    if (!country) {
      return res.status(400).json({ error: "Country is required" });
    }
    
    const numbers = await storage.getNumbersByCountry(country);
    return res.json(numbers);
  } catch (error) {
    log(`Error getting numbers by country: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve numbers" });
  }
});

// Get numbers by range/service type
numberRouter.get("/service/:type", async (req: Request, res: Response) => {
  try {
    const serviceType = req.params.type;
    
    if (!serviceType) {
      return res.status(400).json({ error: "Service type is required" });
    }
    
    const numbers = await storage.getNumbersByServiceType(serviceType);
    return res.json(numbers);
  } catch (error) {
    log(`Error getting numbers by service type: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve numbers" });
  }
});

export default numberRouter;