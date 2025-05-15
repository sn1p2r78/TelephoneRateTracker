import { 
  User, InsertUser, 
  Number, InsertNumber, 
  CallLog, InsertCallLog, 
  SMSLog, InsertSMSLog, 
  UserMessage, InsertUserMessage, 
  ApiIntegration, InsertApiIntegration, 
  Setting, InsertSetting,
  ActivityType,
  SmsAutoResponder, InsertSmsAutoResponder,
  users, numbers, callLogs, smsLogs, userMessages, apiIntegrations, settings, smsAutoResponders
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Premium Numbers
  getAllNumbers(): Promise<Number[]>;
  getNumber(id: number): Promise<Number | undefined>;
  createNumber(number: InsertNumber): Promise<Number>;
  updateNumber(id: number, number: InsertNumber): Promise<Number | undefined>;
  getActiveNumbersCount(): Promise<number>;
  
  // Call Logs
  getAllCallLogs(): Promise<CallLog[]>;
  getCallLog(id: number): Promise<CallLog | undefined>;
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  getTotalCallMinutes(): Promise<number>;
  
  // SMS Logs
  getAllSMSLogs(): Promise<SMSLog[]>;
  getSMSLog(id: number): Promise<SMSLog | undefined>;
  createSMSLog(smsLog: InsertSMSLog): Promise<SMSLog>;
  getTotalSMSCount(): Promise<number>;
  
  // User Messages
  getAllUserMessages(): Promise<UserMessage[]>;
  getUserMessage(id: number): Promise<UserMessage | undefined>;
  createUserMessage(userMessage: InsertUserMessage): Promise<UserMessage>;
  updateUserMessage(id: number, userMessage: InsertUserMessage): Promise<UserMessage | undefined>;
  
  // API Integrations
  getAllApiIntegrations(): Promise<ApiIntegration[]>;
  getApiIntegration(id: number): Promise<ApiIntegration | undefined>;
  createApiIntegration(apiIntegration: InsertApiIntegration): Promise<ApiIntegration>;
  
  // Settings
  getAllSettings(): Promise<Setting[]>;
  getSetting(id: number): Promise<Setting | undefined>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(id: number, setting: InsertSetting): Promise<Setting | undefined>;
  
  // SMS Auto-responders
  getAllAutoResponders(): Promise<SmsAutoResponder[]>;
  getAutoRespondersByNumber(numberId: number): Promise<SmsAutoResponder[]>;
  getAutoResponder(id: number): Promise<SmsAutoResponder | undefined>;
  createAutoResponder(autoResponder: InsertSmsAutoResponder): Promise<SmsAutoResponder>;
  updateAutoResponder(id: number, autoResponder: InsertSmsAutoResponder): Promise<SmsAutoResponder | undefined>;
  deleteAutoResponder(id: number): Promise<boolean>;
  getMatchingAutoResponders(numberId: number, message: string): Promise<SmsAutoResponder[]>;
  
  // Dashboard Analytics
  getTotalRevenue(): Promise<number>;
  getRecentActivity(): Promise<ActivityType[]>;
  getTopPerformingCountries(): Promise<{country: string, revenue: number}[]>;
  getServicePerformance(): Promise<{name: string, type: string, revenue: number, performance: string, change: number, usage: number}[]>;
  
  // Session Store
  sessionStore: any; // Using any type here for session store
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Premium Numbers
  async getAllNumbers(): Promise<Number[]> {
    return await db.select().from(numbers).orderBy(desc(numbers.id));
  }

  async getNumber(id: number): Promise<Number | undefined> {
    const [number] = await db.select().from(numbers).where(eq(numbers.id, id));
    return number;
  }

  async createNumber(insertNumber: InsertNumber): Promise<Number> {
    const [number] = await db
      .insert(numbers)
      .values(insertNumber)
      .returning();
    return number;
  }

  async updateNumber(id: number, update: InsertNumber): Promise<Number | undefined> {
    const [updated] = await db
      .update(numbers)
      .set(update)
      .where(eq(numbers.id, id))
      .returning();
    return updated;
  }

  async getActiveNumbersCount(): Promise<number> {
    const result = await db.select().from(numbers).where(eq(numbers.isActive, true));
    return result.length;
  }

  // Call Logs
  async getAllCallLogs(): Promise<CallLog[]> {
    return await db.select().from(callLogs).orderBy(desc(callLogs.timestamp));
  }

  async getCallLog(id: number): Promise<CallLog | undefined> {
    const [log] = await db.select().from(callLogs).where(eq(callLogs.id, id));
    return log;
  }

  async createCallLog(insertCallLog: InsertCallLog): Promise<CallLog> {
    const [log] = await db
      .insert(callLogs)
      .values(insertCallLog)
      .returning();
    return log;
  }

  async getTotalCallMinutes(): Promise<number> {
    const logs = await db.select().from(callLogs);
    return logs.reduce((sum, log) => sum + (log.duration || 0), 0);
  }

  // SMS Logs
  async getAllSMSLogs(): Promise<SMSLog[]> {
    return await db.select().from(smsLogs).orderBy(desc(smsLogs.timestamp));
  }

  async getSMSLog(id: number): Promise<SMSLog | undefined> {
    const [log] = await db.select().from(smsLogs).where(eq(smsLogs.id, id));
    return log;
  }

  async createSMSLog(insertSMSLog: InsertSMSLog): Promise<SMSLog> {
    const [log] = await db
      .insert(smsLogs)
      .values(insertSMSLog)
      .returning();
    return log;
  }

  async getTotalSMSCount(): Promise<number> {
    const result = await db.select().from(smsLogs);
    return result.length;
  }

  // User Messages
  async getAllUserMessages(): Promise<UserMessage[]> {
    return await db.select().from(userMessages).orderBy(desc(userMessages.timestamp));
  }

  async getUserMessage(id: number): Promise<UserMessage | undefined> {
    const [message] = await db.select().from(userMessages).where(eq(userMessages.id, id));
    return message;
  }

  async createUserMessage(insertUserMessage: InsertUserMessage): Promise<UserMessage> {
    const [message] = await db
      .insert(userMessages)
      .values(insertUserMessage)
      .returning();
    return message;
  }

  async updateUserMessage(id: number, update: InsertUserMessage): Promise<UserMessage | undefined> {
    const [updated] = await db
      .update(userMessages)
      .set(update)
      .where(eq(userMessages.id, id))
      .returning();
    return updated;
  }

  // API Integrations
  async getAllApiIntegrations(): Promise<ApiIntegration[]> {
    return await db.select().from(apiIntegrations).orderBy(desc(apiIntegrations.id));
  }

  async getApiIntegration(id: number): Promise<ApiIntegration | undefined> {
    const [integration] = await db.select().from(apiIntegrations).where(eq(apiIntegrations.id, id));
    return integration;
  }

  async createApiIntegration(insertApiIntegration: InsertApiIntegration): Promise<ApiIntegration> {
    const [integration] = await db
      .insert(apiIntegrations)
      .values(insertApiIntegration)
      .returning();
    return integration;
  }

  // Settings
  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(desc(settings.id));
  }

  async getSetting(id: number): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.id, id));
    return setting;
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async createSetting(insertSetting: InsertSetting): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values(insertSetting)
      .returning();
    return setting;
  }

  async updateSetting(id: number, update: InsertSetting): Promise<Setting | undefined> {
    const [updated] = await db
      .update(settings)
      .set(update)
      .where(eq(settings.id, id))
      .returning();
    return updated;
  }

  // Dashboard Analytics - These are more complex queries that combine data from multiple tables
  async getTotalRevenue(): Promise<number> {
    // In a real application, you would calculate this from call and SMS records
    // For demo purposes, we'll return a sample value
    return 15000;
  }

  async getRecentActivity(): Promise<ActivityType[]> {
    // Combine recent call and SMS logs into a single activity feed
    const recentCalls = await db.select().from(callLogs).orderBy(desc(callLogs.startTime)).limit(5);
    const recentSMS = await db.select().from(smsLogs).orderBy(desc(smsLogs.timestamp)).limit(5);
    
    const callActivities = recentCalls.map(call => ({
      ...call,
      activityType: 'call' as const,
      numberValue: call.numberValue || call.caller || 'Unknown',
      timestamp: call.startTime,
      status: call.status,
      contactName: call.caller,
      contactNumber: call.recipient,
      duration: call.duration,
      callDuration: call.duration
    } as ActivityType));
    
    const smsActivities = recentSMS.map(sms => ({
      ...sms,
      activityType: 'sms' as const,
      numberValue: sms.numberValue || sms.sender || 'Unknown',
      timestamp: sms.timestamp,
      status: sms.status,
      contactName: sms.sender,
      contactNumber: sms.recipient,
      messageContent: sms.message,
      messageSize: sms.messageLength
    } as ActivityType));
    
    // Combine and sort by timestamp, handling null timestamps
    return [...callActivities, ...smsActivities]
      .sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 10);
  }

  async getTopPerformingCountries(): Promise<{country: string, revenue: number}[]> {
    // In a real app, this would be aggregated from call and SMS records
    // For demo purposes, return sample data
    return [
      { country: "United States", revenue: 5200 },
      { country: "United Kingdom", revenue: 3800 },
      { country: "Germany", revenue: 2100 },
      { country: "France", revenue: 1700 },
      { country: "Australia", revenue: 1200 }
    ];
  }

  async getServicePerformance(): Promise<{name: string, type: string, revenue: number, performance: string, change: number, usage: number}[]> {
    // In a real app, this would be calculated from usage statistics
    // For demo purposes, return sample data
    return [
      { name: "Premium Voice", type: "voice", revenue: 6500, performance: "high", change: 12, usage: 7500 },
      { name: "Premium SMS", type: "sms", revenue: 4800, performance: "medium", change: 8, usage: 12000 },
      { name: "IVR Services", type: "voice", revenue: 2200, performance: "medium", change: -3, usage: 3200 },
      { name: "Shortcodes", type: "sms", revenue: 1500, performance: "low", change: 5, usage: 8000 }
    ];
  }
  
  // SMS Auto-responders Implementation
  async getAllAutoResponders(): Promise<SmsAutoResponder[]> {
    try {
      const autoResponders = await db
        .select()
        .from(smsAutoResponders)
        .orderBy(desc(smsAutoResponders.priority));
      return autoResponders;
    } catch (error) {
      console.error("Error getting all auto-responders:", error);
      return [];
    }
  }
  
  async getAutoRespondersByNumber(numberId: number): Promise<SmsAutoResponder[]> {
    try {
      const autoResponders = await db
        .select()
        .from(smsAutoResponders)
        .where(eq(smsAutoResponders.numberId, numberId))
        .orderBy(desc(smsAutoResponders.priority));
      return autoResponders;
    } catch (error) {
      console.error("Error getting auto-responders by number ID:", error);
      return [];
    }
  }
  
  async getAutoResponder(id: number): Promise<SmsAutoResponder | undefined> {
    try {
      const [autoResponder] = await db
        .select()
        .from(smsAutoResponders)
        .where(eq(smsAutoResponders.id, id));
      return autoResponder;
    } catch (error) {
      console.error("Error getting auto-responder by ID:", error);
      return undefined;
    }
  }
  
  async createAutoResponder(autoResponder: InsertSmsAutoResponder): Promise<SmsAutoResponder> {
    try {
      const [newAutoResponder] = await db
        .insert(smsAutoResponders)
        .values(autoResponder)
        .returning();
      return newAutoResponder;
    } catch (error) {
      console.error("Error creating auto-responder:", error);
      throw error;
    }
  }
  
  async updateAutoResponder(id: number, autoResponder: InsertSmsAutoResponder): Promise<SmsAutoResponder | undefined> {
    try {
      const [updatedAutoResponder] = await db
        .update(smsAutoResponders)
        .set({
          ...autoResponder,
          updatedAt: new Date()
        })
        .where(eq(smsAutoResponders.id, id))
        .returning();
      return updatedAutoResponder;
    } catch (error) {
      console.error("Error updating auto-responder:", error);
      return undefined;
    }
  }
  
  async deleteAutoResponder(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(smsAutoResponders)
        .where(eq(smsAutoResponders.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting auto-responder:", error);
      return false;
    }
  }
  
  async getMatchingAutoResponders(numberId: number, message: string): Promise<SmsAutoResponder[]> {
    try {
      // Get all auto-responders for this number
      const allResponders = await this.getAutoRespondersByNumber(numberId);
      
      // Filter only active responders
      const activeResponders = allResponders.filter(responder => responder.isActive);
      
      // Find matching responders based on triggerType
      const matchingResponders = activeResponders.filter(responder => {
        if (responder.triggerType === 'any') {
          return true; // Responds to any message
        }
        
        if (!responder.triggerValue) {
          return false; // No trigger value set
        }
        
        if (responder.triggerType === 'keyword') {
          // For keyword matching
          if (responder.matchCase) {
            // Case-sensitive match
            return message.includes(responder.triggerValue);
          } else {
            // Case-insensitive match
            return message.toLowerCase().includes(responder.triggerValue.toLowerCase());
          }
        }
        
        if (responder.triggerType === 'regex') {
          // For regex matching
          try {
            const flags = responder.matchCase ? '' : 'i'; // Use case-insensitive flag if matchCase is false
            const regex = new RegExp(responder.triggerValue, flags);
            return regex.test(message);
          } catch (error) {
            console.error("Invalid regex pattern:", responder.triggerValue, error);
            return false;
          }
        }
        
        return false;
      });
      
      // Sort by priority (higher number = higher priority)
      return matchingResponders.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    } catch (error) {
      console.error("Error getting matching auto-responders:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();