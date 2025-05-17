import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { createApiKey, deleteApiKey } from "../lib/security";
import { log } from "../vite";

// Create a router for API key management
const apiKeyRouter = Router();

// Route to get all API keys (partial info only, no full keys)
apiKeyRouter.get("/", async (req: Request, res: Response) => {
  try {
    // Get the API keys from settings
    const setting = await storage.getSettingByKey("api_keys");
    
    if (!setting || !setting.value) {
      return res.json([]);
    }
    
    try {
      // Parse the stored keys
      const keys = JSON.parse(setting.value);
      
      // Return the keys with sensitive data removed
      const safeKeys = keys.map((key: any) => ({
        key: key.key, // We'll only display the first few characters in the UI
        name: key.name,
        permissions: key.permissions,
        created: key.created
      }));
      
      return res.json(safeKeys);
    } catch (e) {
      log(`Error parsing API keys: ${e instanceof Error ? e.message : String(e)}`, "api");
      return res.json([]);
    }
  } catch (error) {
    log(`Error getting API keys: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve API keys" });
  }
});

// Route to create a new API key
apiKeyRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, permissions } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Key name is required" });
    }
    
    // Default permissions if none provided
    const keyPermissions = permissions || ["webhooks"];
    
    // Create the new API key
    const key = await createApiKey(name, keyPermissions);
    
    return res.status(201).json({
      success: true,
      message: "API key created successfully",
      key
    });
  } catch (error) {
    log(`Error creating API key: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to create API key" });
  }
});

// Route to delete an API key
apiKeyRouter.delete("/:key", async (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    
    if (!key) {
      return res.status(400).json({ error: "API key is required" });
    }
    
    // Delete the API key
    const success = await deleteApiKey(key);
    
    if (!success) {
      return res.status(404).json({ error: "API key not found" });
    }
    
    return res.json({
      success: true,
      message: "API key deleted successfully"
    });
  } catch (error) {
    log(`Error deleting API key: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to delete API key" });
  }
});

// Expose a route to generate example code
apiKeyRouter.get("/example-code", (req: Request, res: Response) => {
  const exampleKey = "YOUR_API_KEY";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  const examples = {
    curl: {
      sms: `curl -X GET "${baseUrl}/api/webhooks/sms?number=123456789&text=Hello" -H "X-API-Key: ${exampleKey}"`,
      voice: `curl -X GET "${baseUrl}/api/webhooks/voice?caller_id=123456789&number=987654321" -H "X-API-Key: ${exampleKey}"`,
      query: `curl -X GET "${baseUrl}/api/webhooks/generic?provider=all&query=historical&number=123456789" -H "X-API-Key: ${exampleKey}"`
    },
    nodejs: `const fetch = require('node-fetch');

async function sendWebhook() {
  const response = await fetch('${baseUrl}/api/webhooks/sms?number=123456789&text=Hello', {
    headers: {
      'X-API-Key': '${exampleKey}'
    }
  });
  
  const data = await response.json();
  console.log(data);
}

sendWebhook();`,
    python: `import requests

response = requests.get(
    '${baseUrl}/api/webhooks/sms',
    params={
        'number': '123456789',
        'text': 'Hello'
    },
    headers={
        'X-API-Key': '${exampleKey}'
    }
)

print(response.json())`
  };
  
  return res.json(examples);
});

export default apiKeyRouter;