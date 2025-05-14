import { log } from "../vite";
import { smppManager } from "./smpp";
import { storage } from "../storage";
import { ApiIntegration } from "@shared/schema";

// Integration types supported by the system
export enum IntegrationType {
  SMPP = "smpp",
  HTTP = "http"
}

// Initialize all integrations in the system
export async function initializeIntegrations() {
  try {
    log("Initializing integrations...", "integrations");
    
    // Load all API integrations from storage
    const integrations = await storage.getAllApiIntegrations();
    
    // Initialize each integration based on type
    for (const integration of integrations) {
      try {
        if (integration.integrationType === IntegrationType.SMPP) {
          // Initialize SMPP connection
          const connection = smppManager.initConnection(integration);
          log(`Initialized SMPP integration: ${integration.name}`, "integrations");
          
          // Auto-connect if needed
          const config = integration.config ? JSON.parse(integration.config) : {};
          if (config.autoConnect) {
            connection.connect().then(success => {
              if (success) {
                log(`Auto-connected to SMPP: ${integration.name}`, "integrations");
              } else {
                log(`Failed to auto-connect to SMPP: ${integration.name}`, "integrations");
              }
            });
          }
        } else if (integration.integrationType === IntegrationType.HTTP) {
          // HTTP integrations don't need initialization, they handle webhooks
          log(`Registered HTTP integration: ${integration.name}`, "integrations");
        } else {
          log(`Unknown integration type: ${integration.integrationType} for ${integration.name}`, "integrations");
        }
      } catch (error: any) {
        log(`Error initializing integration ${integration.name}: ${error.message}`, "integrations");
      }
    }
    
    log("All integrations initialized", "integrations");
  } catch (error: any) {
    log(`Error initializing integrations: ${error.message}`, "integrations");
  }
}

// Handle creation of a new integration
export async function handleNewIntegration(integration: ApiIntegration) {
  try {
    if (integration.integrationType === IntegrationType.SMPP) {
      const connection = smppManager.initConnection(integration);
      log(`New SMPP integration initialized: ${integration.name}`, "integrations");
      
      // Auto-connect if needed
      const config = integration.config ? JSON.parse(integration.config) : {};
      if (config.autoConnect) {
        connection.connect().then(success => {
          if (success) {
            log(`Auto-connected to SMPP: ${integration.name}`, "integrations");
          } else {
            log(`Failed to auto-connect to SMPP: ${integration.name}`, "integrations");
          }
        });
      }
    } else if (integration.integrationType === IntegrationType.HTTP) {
      // HTTP integrations don't need initialization
      log(`New HTTP integration registered: ${integration.name}`, "integrations");
    }
  } catch (error: any) {
    log(`Error handling new integration ${integration.name}: ${error.message}`, "integrations");
  }
}

// Handle updates to an existing integration
export async function handleIntegrationUpdate(integration: ApiIntegration) {
  try {
    if (integration.integrationType === IntegrationType.SMPP) {
      // Remove existing connection if any
      smppManager.removeConnection(integration.id);
      
      // Create a new connection with updated settings
      const connection = smppManager.initConnection(integration);
      log(`Updated SMPP integration: ${integration.name}`, "integrations");
      
      // Auto-connect if needed
      const config = integration.config ? JSON.parse(integration.config) : {};
      if (config.autoConnect) {
        connection.connect().then(success => {
          if (success) {
            log(`Auto-connected to updated SMPP: ${integration.name}`, "integrations");
          } else {
            log(`Failed to auto-connect to updated SMPP: ${integration.name}`, "integrations");
          }
        });
      }
    } else if (integration.integrationType === IntegrationType.HTTP) {
      // HTTP integrations don't need special handling for updates
      log(`Updated HTTP integration: ${integration.name}`, "integrations");
    }
  } catch (error: any) {
    log(`Error handling integration update for ${integration.name}: ${error.message}`, "integrations");
  }
}

// Handle deletion of an integration
export async function handleIntegrationRemoval(integrationId: number) {
  try {
    // Remove SMPP connection if it exists
    smppManager.removeConnection(integrationId);
    log(`Removed integration #${integrationId}`, "integrations");
  } catch (error: any) {
    log(`Error removing integration #${integrationId}: ${error.message}`, "integrations");
  }
}

// Get status information for all integrations
export async function getIntegrationsStatus() {
  try {
    // Get all SMPP connections
    const smppConnections = smppManager.getAllConnections();
    
    // Build status report
    const smppStatus = smppConnections.map(conn => ({
      id: conn.id,
      status: conn.status,
      error: conn.lastError,
      host: conn.config.host,
      port: conn.config.port,
      type: 'smpp'
    }));
    
    // In a real system, you would also include HTTP integration status
    
    return {
      smpp: smppStatus,
      http: [],
    };
  } catch (error: any) {
    log(`Error getting integrations status: ${error.message}`, "integrations");
    return { smpp: [], http: [] };
  }
}