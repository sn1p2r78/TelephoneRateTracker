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
  MessageHistory, InsertMessageHistory,
  users, numbers, callLogs, smsLogs, userMessages, apiIntegrations, settings, smsAutoResponders, messageHistory,
  NumberRequest, InsertNumberRequest, 
  numberRequests,
  Payout, InsertPayout,
  payouts
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
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  
  // User-specific methods
  getUserNumbers(userId: number): Promise<Number[]>;
  getUserCallLogs(userId: number, limit?: number): Promise<CallLog[]>;
  getUserSMSLogs(userId: number, limit?: number): Promise<SMSLog[]>;
  getUserCallLogsFiltered(userId: number, fromDate?: Date, toDate?: Date, phoneNumber?: string): Promise<CallLog[]>;
  getUserSMSLogsFiltered(userId: number, fromDate?: Date, toDate?: Date, phoneNumber?: string): Promise<SMSLog[]>;
  getUserPayouts(userId: number): Promise<Payout[]>;
  
  // Role-based access control
  assignNumberToUser(userId: number, numberId: number, isTest?: boolean): Promise<UserNumber>;
  removeNumberFromUser(userId: number, numberId: number): Promise<boolean>;
  getNumbersByUserRole(userId: number): Promise<Number[]>;
  isTestAccount(userId: number): Promise<boolean>;
  
  // Premium Numbers
  getAllNumbers(): Promise<Number[]>;
  getNumber(id: number): Promise<Number | undefined>;
  createNumber(number: InsertNumber): Promise<Number>;
  updateNumber(id: number, number: InsertNumber): Promise<Number | undefined>;
  getActiveNumbersCount(): Promise<number>;
  getNumbersByCountry(country: string): Promise<Number[]>;
  getNumbersByServiceType(serviceType: string): Promise<Number[]>;
  
  // Number Requests
  createNumberRequest(request: InsertNumberRequest): Promise<NumberRequest>;
  getAllNumberRequests(): Promise<NumberRequest[]>;
  getUserNumberRequests(userId: number): Promise<NumberRequest[]>;
  getNumberRequest(id: number): Promise<NumberRequest | undefined>;
  updateNumberRequest(id: number, request: Partial<InsertNumberRequest>): Promise<NumberRequest | undefined>;
  
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
  
  // Message History (CDIR)
  getAllMessageHistory(): Promise<MessageHistory[]>;
  getMessageHistoryByNumber(phoneNumber: string): Promise<MessageHistory[]>;
  createMessageHistory(message: InsertMessageHistory): Promise<MessageHistory>;
  updateMessageResponse(id: number, responseText: string): Promise<MessageHistory | undefined>;
  
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
  
  // Methods for Storage interface extension for role-based access
  async assignNumberToUser(userId: number, numberId: number, isTest: boolean = false): Promise<any> {
    const [userNumber] = await db
      .insert(userNumbers)
      .values({
        userId,
        numberId,
        isTest
      })
      .returning();
    return userNumber;
  }
  
  async removeNumberFromUser(userId: number, numberId: number): Promise<boolean> {
    const result = await db
      .delete(userNumbers)
      .where(
        and(
          eq(userNumbers.userId, userId),
          eq(userNumbers.numberId, numberId)
        )
      );
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getNumbersByUserRole(userId: number): Promise<Number[]> {
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }
    
    // Get numbers assigned to this user
    const userNumberRows = await db
      .select({
        numberId: userNumbers.numberId
      })
      .from(userNumbers)
      .where(eq(userNumbers.userId, userId));
      
    const userNumberIds = userNumberRows.map(row => row.numberId);
    
    if (userNumberIds.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(numbers)
      .where(inArray(numbers.id, userNumberIds));
  }
  
  async isTestAccount(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user ? user.role === 'test' : false;
  }
  
  async getAllPayouts(): Promise<Payout[]> {
    return await db
      .select()
      .from(payouts)
      .orderBy(desc(payouts.requestedAt));
  }

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
  
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(users.username);
  }
  
  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return updated;
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
  
  // Number query methods
  async getNumbersByCountry(country: string): Promise<Number[]> {
    return await db
      .select()
      .from(numbers)
      .where(eq(numbers.countryCode, country));
  }
  
  async getNumbersByServiceType(serviceType: string): Promise<Number[]> {
    return await db
      .select()
      .from(numbers)
      .where(eq(numbers.serviceType, serviceType));
  }
  
  // User-specific methods
  async getUserNumbers(userId: number): Promise<Number[]> {
    // For a real app, we'd have a user-number relationship table
    // For now, we'll just return all numbers since we don't have that relation
    return await db.select().from(numbers).where(eq(numbers.isActive, true));
  }
  
  async getUserCallLogs(userId: number, limit?: number): Promise<CallLog[]> {
    // For a real app, we'd filter by user ID
    // For now, return all call logs with optional limit
    const query = db.select().from(callLogs).orderBy(desc(callLogs.startTime));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getUserSMSLogs(userId: number, limit?: number): Promise<SMSLog[]> {
    // For a real app, we'd filter by user ID
    // For now, return all SMS logs with optional limit
    const query = db.select().from(smsLogs).orderBy(desc(smsLogs.timestamp));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getUserCallLogsFiltered(
    userId: number, 
    fromDate?: Date, 
    toDate?: Date, 
    phoneNumber?: string
  ): Promise<CallLog[]> {
    // Build query filters
    const filters = [];
    
    // Apply date filters if provided
    if (fromDate) {
      filters.push(callLogs.startTime >= fromDate);
    }
    
    if (toDate) {
      filters.push(callLogs.startTime <= toDate);
    }
    
    // Apply phone number filter if provided
    if (phoneNumber) {
      filters.push(
        or(
          eq(callLogs.caller, phoneNumber),
          eq(callLogs.recipient, phoneNumber),
          eq(callLogs.numberValue, phoneNumber)
        )
      );
    }
    
    // Create and execute query
    if (filters.length > 0) {
      return await db
        .select()
        .from(callLogs)
        .where(and(...filters))
        .orderBy(desc(callLogs.startTime));
    } else {
      return await db
        .select()
        .from(callLogs)
        .orderBy(desc(callLogs.startTime));
    }
  }
  
  async getUserSMSLogsFiltered(
    userId: number, 
    fromDate?: Date, 
    toDate?: Date, 
    phoneNumber?: string
  ): Promise<SMSLog[]> {
    // Build query filters
    const filters = [];
    
    // Apply date filters if provided
    if (fromDate) {
      filters.push(smsLogs.timestamp >= fromDate);
    }
    
    if (toDate) {
      filters.push(smsLogs.timestamp <= toDate);
    }
    
    // Apply phone number filter if provided
    if (phoneNumber) {
      filters.push(
        or(
          eq(smsLogs.sender, phoneNumber),
          eq(smsLogs.recipient, phoneNumber),
          eq(smsLogs.numberValue, phoneNumber)
        )
      );
    }
    
    // Create and execute query
    if (filters.length > 0) {
      return await db
        .select()
        .from(smsLogs)
        .where(and(...filters))
        .orderBy(desc(smsLogs.timestamp));
    } else {
      return await db
        .select()
        .from(smsLogs)
        .orderBy(desc(smsLogs.timestamp));
    }
  }
  
  async getUserPayouts(userId: number): Promise<Payout[]> {
    return await db
      .select()
      .from(payouts)
      .where(eq(payouts.userId, userId))
      .orderBy(desc(payouts.requestedAt));
  }
  
  // Role-based access control methods
  async assignNumberToUser(userId: number, numberId: number, isTest: boolean = false): Promise<UserNumber> {
    const [userNumber] = await db
      .insert(userNumbers)
      .values({
        userId,
        numberId,
        isTest
      })
      .returning();
    return userNumber;
  }
  
  async removeNumberFromUser(userId: number, numberId: number): Promise<boolean> {
    const result = await db
      .delete(userNumbers)
      .where(
        and(
          eq(userNumbers.userId, userId),
          eq(userNumbers.numberId, numberId)
        )
      );
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getNumbersByUserRole(userId: number): Promise<Number[]> {
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }
    
    // Get numbers assigned to this user
    const userNumbersQuery = db
      .select({
        numberId: userNumbers.numberId
      })
      .from(userNumbers)
      .where(eq(userNumbers.userId, userId));
      
    const userNumberIds = (await userNumbersQuery).map(row => row.numberId);
    
    if (userNumberIds.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(numbers)
      .where(inArray(numbers.id, userNumberIds));
  }
  
  async isTestAccount(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user ? user.role === 'test' : false;
  }

  // Call Logs
  async getAllCallLogs(): Promise<CallLog[]> {
    return await db.select().from(callLogs).orderBy(desc(callLogs.startTime));
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
  
  // Message History (CDIR) Implementation
  async getAllMessageHistory(): Promise<MessageHistory[]> {
    try {
      const messages = await db
        .select()
        .from(messageHistory)
        .orderBy(desc(messageHistory.timestamp));
      return messages;
    } catch (error) {
      console.error("Error getting all message history:", error);
      return [];
    }
  }
  
  async getMessageHistoryByNumber(phoneNumber: string): Promise<MessageHistory[]> {
    try {
      const messages = await db
        .select()
        .from(messageHistory)
        .where(eq(messageHistory.phoneNumber, phoneNumber))
        .orderBy(desc(messageHistory.timestamp));
      return messages;
    } catch (error) {
      console.error("Error getting message history by phone number:", error);
      return [];
    }
  }
  
  async createMessageHistory(message: InsertMessageHistory): Promise<MessageHistory> {
    try {
      const [newMessage] = await db
        .insert(messageHistory)
        .values(message)
        .returning();
      
      // If we have a message, try to find a matching auto-responder
      if (message.messageText) {
        // Get all numbers to find a matching one
        const allNumbers = await this.getAllNumbers();
        
        // Try to find a number that contains this phone number (removing any prefixes like +)
        const cleanPhoneNumber = message.phoneNumber.replace(/^\+/, '');
        const matchingNumber = allNumbers.find(num => 
          cleanPhoneNumber.includes(num.number) || num.number.includes(cleanPhoneNumber)
        );
        
        if (matchingNumber) {
          const matchingResponders = await this.getMatchingAutoResponders(
            matchingNumber.id, 
            message.messageText
          );
          
          if (matchingResponders.length > 0) {
            // We have a match, update the response
            const topResponder = matchingResponders[0];
            await this.updateMessageResponse(newMessage.id, topResponder.responseMessage);
            
            // Also get the updated message to return
            const [updatedMessage] = await db
              .select()
              .from(messageHistory)
              .where(eq(messageHistory.id, newMessage.id));
              
            return updatedMessage;
          }
        }
      }
      
      return newMessage;
    } catch (error) {
      console.error("Error creating message history:", error);
      throw error;
    }
  }
  
  async updateMessageResponse(id: number, responseText: string): Promise<MessageHistory | undefined> {
    try {
      const [updatedMessage] = await db
        .update(messageHistory)
        .set({
          responseText,
          responseTimestamp: new Date(),
          isProcessed: true
        })
        .where(eq(messageHistory.id, id))
        .returning();
      return updatedMessage;
    } catch (error) {
      console.error("Error updating message response:", error);
      return undefined;
    }
  }
  
  // Number Request methods
  async createNumberRequest(request: InsertNumberRequest): Promise<NumberRequest> {
    try {
      const [newRequest] = await db
        .insert(numberRequests)
        .values(request)
        .returning();
      
      return newRequest;
    } catch (error) {
      console.error("Error creating number request:", error);
      throw error;
    }
  }
  
  async getAllNumberRequests(): Promise<NumberRequest[]> {
    try {
      return await db
        .select()
        .from(numberRequests)
        .orderBy(desc(numberRequests.createdAt));
    } catch (error) {
      console.error("Error getting all number requests:", error);
      return [];
    }
  }
  
  async getUserNumberRequests(userId: number): Promise<NumberRequest[]> {
    try {
      return await db
        .select()
        .from(numberRequests)
        .where(eq(numberRequests.userId, userId))
        .orderBy(desc(numberRequests.createdAt));
    } catch (error) {
      console.error("Error getting user number requests:", error);
      return [];
    }
  }
  
  async getNumberRequest(id: number): Promise<NumberRequest | undefined> {
    try {
      const [request] = await db
        .select()
        .from(numberRequests)
        .where(eq(numberRequests.id, id));
      
      return request;
    } catch (error) {
      console.error("Error getting number request:", error);
      return undefined;
    }
  }
  
  async updateNumberRequest(id: number, request: Partial<InsertNumberRequest>): Promise<NumberRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(numberRequests)
        .set({
          ...request,
          updatedAt: new Date()
        })
        .where(eq(numberRequests.id, id))
        .returning();
      
      return updatedRequest;
    } catch (error) {
      console.error("Error updating number request:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();