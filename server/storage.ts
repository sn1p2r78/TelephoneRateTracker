import { 
  User, InsertUser, 
  Number, InsertNumber, 
  CallLog, InsertCallLog, 
  SMSLog, InsertSMSLog, 
  UserMessage, InsertUserMessage,
  ApiIntegration, InsertApiIntegration,
  Setting, InsertSetting,
  ActivityType
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

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
  
  // Dashboard Analytics
  getTotalRevenue(): Promise<number>;
  getRecentActivity(): Promise<ActivityType[]>;
  getTopPerformingCountries(): Promise<{country: string, revenue: number}[]>;
  getServicePerformance(): Promise<{name: string, type: string, revenue: number, performance: string, change: number, usage: number}[]>;
  
  // Session Store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private numbers: Map<number, Number>;
  private callLogs: Map<number, CallLog>;
  private smsLogs: Map<number, SMSLog>;
  private userMessages: Map<number, UserMessage>;
  private apiIntegrations: Map<number, ApiIntegration>;
  private settings: Map<number, Setting>;
  
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentNumberId: number;
  currentCallLogId: number;
  currentSMSLogId: number;
  currentUserMessageId: number;
  currentApiIntegrationId: number;
  currentSettingId: number;

  constructor() {
    this.users = new Map();
    this.numbers = new Map();
    this.callLogs = new Map();
    this.smsLogs = new Map();
    this.userMessages = new Map();
    this.apiIntegrations = new Map();
    this.settings = new Map();
    
    this.currentUserId = 1;
    this.currentNumberId = 1;
    this.currentCallLogId = 1;
    this.currentSMSLogId = 1;
    this.currentUserMessageId = 1;
    this.currentApiIntegrationId = 1;
    this.currentSettingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Premium Numbers
  async getAllNumbers(): Promise<Number[]> {
    return Array.from(this.numbers.values());
  }

  async getNumber(id: number): Promise<Number | undefined> {
    return this.numbers.get(id);
  }

  async createNumber(number: InsertNumber): Promise<Number> {
    const id = this.currentNumberId++;
    const newNumber: Number = { ...number, id, createdAt: new Date() };
    this.numbers.set(id, newNumber);
    return newNumber;
  }
  
  async updateNumber(id: number, update: InsertNumber): Promise<Number | undefined> {
    const existing = this.numbers.get(id);
    if (!existing) return undefined;
    
    const updated: Number = { ...existing, ...update };
    this.numbers.set(id, updated);
    return updated;
  }
  
  async getActiveNumbersCount(): Promise<number> {
    return Array.from(this.numbers.values()).filter(n => n.isActive).length;
  }

  // Call Logs
  async getAllCallLogs(): Promise<CallLog[]> {
    return Array.from(this.callLogs.values());
  }

  async getCallLog(id: number): Promise<CallLog | undefined> {
    return this.callLogs.get(id);
  }

  async createCallLog(callLog: InsertCallLog): Promise<CallLog> {
    const id = this.currentCallLogId++;
    const newCallLog: CallLog = { ...callLog, id, timestamp: new Date() };
    this.callLogs.set(id, newCallLog);
    return newCallLog;
  }
  
  async getTotalCallMinutes(): Promise<number> {
    const totalSeconds = Array.from(this.callLogs.values()).reduce(
      (total, log) => total + log.duration, 0
    );
    return Math.floor(totalSeconds / 60);
  }

  // SMS Logs
  async getAllSMSLogs(): Promise<SMSLog[]> {
    return Array.from(this.smsLogs.values());
  }

  async getSMSLog(id: number): Promise<SMSLog | undefined> {
    return this.smsLogs.get(id);
  }

  async createSMSLog(smsLog: InsertSMSLog): Promise<SMSLog> {
    const id = this.currentSMSLogId++;
    const newSMSLog: SMSLog = { ...smsLog, id, timestamp: new Date() };
    this.smsLogs.set(id, newSMSLog);
    return newSMSLog;
  }
  
  async getTotalSMSCount(): Promise<number> {
    return this.smsLogs.size;
  }

  // User Messages
  async getAllUserMessages(): Promise<UserMessage[]> {
    return Array.from(this.userMessages.values());
  }

  async getUserMessage(id: number): Promise<UserMessage | undefined> {
    return this.userMessages.get(id);
  }

  async createUserMessage(userMessage: InsertUserMessage): Promise<UserMessage> {
    const id = this.currentUserMessageId++;
    const newUserMessage: UserMessage = { ...userMessage, id, timestamp: new Date() };
    this.userMessages.set(id, newUserMessage);
    return newUserMessage;
  }
  
  async updateUserMessage(id: number, update: InsertUserMessage): Promise<UserMessage | undefined> {
    const existing = this.userMessages.get(id);
    if (!existing) return undefined;
    
    const updated: UserMessage = { ...existing, ...update };
    this.userMessages.set(id, updated);
    return updated;
  }

  // API Integrations
  async getAllApiIntegrations(): Promise<ApiIntegration[]> {
    return Array.from(this.apiIntegrations.values());
  }

  async getApiIntegration(id: number): Promise<ApiIntegration | undefined> {
    return this.apiIntegrations.get(id);
  }

  async createApiIntegration(apiIntegration: InsertApiIntegration): Promise<ApiIntegration> {
    const id = this.currentApiIntegrationId++;
    const newApiIntegration: ApiIntegration = { ...apiIntegration, id, createdAt: new Date() };
    this.apiIntegrations.set(id, newApiIntegration);
    return newApiIntegration;
  }

  // Settings
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(id: number): Promise<Setting | undefined> {
    return this.settings.get(id);
  }
  
  async getSettingByKey(key: string): Promise<Setting | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.key === key
    );
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const id = this.currentSettingId++;
    const newSetting: Setting = { ...setting, id, updatedAt: new Date() };
    this.settings.set(id, newSetting);
    return newSetting;
  }
  
  async updateSetting(id: number, update: InsertSetting): Promise<Setting | undefined> {
    const existing = this.settings.get(id);
    if (!existing) return undefined;
    
    const updated: Setting = { ...existing, ...update, updatedAt: new Date() };
    this.settings.set(id, updated);
    return updated;
  }
  
  // Dashboard Analytics
  async getTotalRevenue(): Promise<number> {
    const callRevenue = Array.from(this.callLogs.values()).reduce(
      (total, log) => total + log.revenue, 0
    );
    
    const smsRevenue = Array.from(this.smsLogs.values()).reduce(
      (total, log) => total + log.revenue, 0
    );
    
    return parseFloat((callRevenue + smsRevenue).toFixed(2));
  }
  
  async getRecentActivity(): Promise<ActivityType[]> {
    const callActivities = Array.from(this.callLogs.values()).map(call => {
      const number = this.numbers.get(call.numberId);
      return {
        ...call,
        activityType: 'call' as const,
        numberValue: number ? number.number : 'Unknown',
      };
    });
    
    const smsActivities = Array.from(this.smsLogs.values()).map(sms => {
      const number = this.numbers.get(sms.numberId);
      return {
        ...sms,
        activityType: 'sms' as const,
        numberValue: number ? number.number : 'Unknown',
      };
    });
    
    // Combine and sort by timestamp (newest first)
    const combined = [...callActivities, ...smsActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return combined.slice(0, 10); // Return the 10 most recent activities
  }
  
  async getTopPerformingCountries(): Promise<{country: string, revenue: number}[]> {
    const countryRevenue = new Map<string, number>();
    
    // Sum revenue from call logs by country
    Array.from(this.callLogs.values()).forEach(log => {
      const current = countryRevenue.get(log.countryCode) || 0;
      countryRevenue.set(log.countryCode, current + log.revenue);
    });
    
    // Sum revenue from SMS logs by country
    Array.from(this.smsLogs.values()).forEach(log => {
      const current = countryRevenue.get(log.countryCode) || 0;
      countryRevenue.set(log.countryCode, current + log.revenue);
    });
    
    // Convert to array, sort by revenue (highest first), and format
    return Array.from(countryRevenue.entries())
      .map(([country, revenue]) => ({ 
        country: this.getCountryName(country), 
        revenue: parseFloat(revenue.toFixed(2))
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 countries
  }
  
  async getServicePerformance(): Promise<{name: string, type: string, revenue: number, performance: string, change: number, usage: number}[]> {
    const serviceData = new Map<string, {
      name: string;
      type: string;
      revenue: number;
      callMinutes: number;
      smsCount: number;
      change: number;
    }>();
    
    // Process call logs
    Array.from(this.callLogs.values()).forEach(log => {
      const key = log.serviceType;
      const existing = serviceData.get(key) || {
        name: log.serviceType,
        type: 'voice',
        revenue: 0,
        callMinutes: 0,
        smsCount: 0,
        change: 0 // Placeholder
      };
      
      existing.revenue += log.revenue;
      existing.callMinutes += Math.floor(log.duration / 60);
      serviceData.set(key, existing);
    });
    
    // Process SMS logs
    Array.from(this.smsLogs.values()).forEach(log => {
      const key = log.serviceType;
      const existing = serviceData.get(key) || {
        name: log.serviceType,
        type: 'sms',
        revenue: 0,
        callMinutes: 0,
        smsCount: 0,
        change: 0 // Placeholder
      };
      
      existing.revenue += log.revenue;
      existing.smsCount += 1;
      serviceData.set(key, existing);
    });
    
    // Convert to array, sort by revenue (highest first), and format
    return Array.from(serviceData.values())
      .map(service => {
        let performance: string;
        if (service.revenue > 3000) {
          performance = 'High Performance';
        } else if (service.revenue > 1000) {
          performance = 'Medium Performance';
        } else {
          performance = 'Low Performance';
        }
        
        // Generate a random change percentage for demonstration
        const change = Math.floor(Math.random() * 30) - 10; // Random number between -10 and +20
        
        return {
          name: service.name,
          type: service.type,
          revenue: parseFloat(service.revenue.toFixed(2)),
          performance,
          change,
          usage: service.type === 'voice' ? service.callMinutes : service.smsCount
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 services
  }
  
  // Helper methods
  private getCountryName(countryCode: string): string {
    const countryMap: Record<string, string> = {
      'UK': 'United Kingdom',
      'US': 'United States',
      'DE': 'Germany',
      'FR': 'France',
      'AU': 'Australia',
      'JP': 'Japan',
      'RU': 'Russia',
      'NG': 'Nigeria',
      'ZA': 'South Africa'
    };
    
    return countryMap[countryCode] || countryCode;
  }
  
  // Initialize with sample data for demo purposes
  private initializeSampleData(): void {
    // Admin user
    this.createUser({
      username: 'admin',
      password: '$2b$10$WZGN0fM5riypT2Ky7jZuLuZO3jjVXcLglAFwSRD76vgxRBeESWUAK', // "password123"
      fullName: 'John Doe',
      role: 'admin'
    });
    
    // Premium numbers
    const numberData: InsertNumber[] = [
      {
        number: '+44 7700 900123',
        countryCode: 'UK',
        type: 'VOICE',
        serviceType: 'Support Hotline',
        ratePerMinute: 1.5,
        ratePerSMS: null,
        isActive: true
      },
      {
        number: '+44 9012 345678',
        countryCode: 'UK',
        type: 'SMS',
        serviceType: 'Quiz Vote',
        ratePerMinute: null,
        ratePerSMS: 1.5,
        isActive: true
      },
      {
        number: '+1 900 555 0199',
        countryCode: 'US',
        type: 'VOICE',
        serviceType: 'Entertainment',
        ratePerMinute: 2.99,
        ratePerSMS: null,
        isActive: true
      },
      {
        number: '+49 900 123456',
        countryCode: 'DE',
        type: 'VOICE',
        serviceType: 'Psychic Service',
        ratePerMinute: 1.8,
        ratePerSMS: null,
        isActive: true
      },
      {
        number: '+61 190 123456',
        countryCode: 'AU',
        type: 'SMS',
        serviceType: 'Voting Service',
        ratePerMinute: null,
        ratePerSMS: 2.75,
        isActive: true
      }
    ];
    
    numberData.forEach(data => this.createNumber(data));
    
    // Generate call logs
    const generateCallLogs = () => {
      const callLogData: InsertCallLog[] = [
        {
          numberId: 1,
          duration: 522, // 8m 42s
          revenue: 12.8,
          callerNumber: '+44 7123 456789',
          countryCode: 'UK',
          serviceType: 'Support Hotline'
        },
        {
          numberId: 3,
          duration: 198, // 3m 18s
          revenue: 5.95,
          callerNumber: '+1 212 555 1234',
          countryCode: 'US',
          serviceType: 'Entertainment'
        },
        {
          numberId: 4,
          duration: 724, // 12m 04s
          revenue: 18.2,
          callerNumber: '+49 151 1234567',
          countryCode: 'DE',
          serviceType: 'Psychic Service'
        }
      ];
      
      callLogData.forEach(data => this.createCallLog(data));
      
      // Create more random call logs for data volume
      for (let i = 0; i < 40; i++) {
        const numberId = Math.floor(Math.random() * 5) + 1;
        const number = this.numbers.get(numberId);
        
        if (number && number.type === 'VOICE') {
          const duration = Math.floor(Math.random() * 1200) + 60; // 1-20 minutes
          const revenue = parseFloat((duration / 60 * (number.ratePerMinute || 1)).toFixed(2));
          
          this.createCallLog({
            numberId,
            duration,
            revenue,
            callerNumber: `+${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 10000000000)}`,
            countryCode: number.countryCode,
            serviceType: number.serviceType
          });
        }
      }
    };
    
    // Generate SMS logs
    const generateSMSLogs = () => {
      const smsLogData: InsertSMSLog[] = [
        {
          numberId: 2,
          messageLength: 32,
          revenue: 1.5,
          senderNumber: '+44 7123 456789',
          message: 'VOTE A for contestant #3',
          countryCode: 'UK',
          serviceType: 'Quiz Vote'
        },
        {
          numberId: 5,
          messageLength: 18,
          revenue: 2.75,
          senderNumber: '+61 412 345 678',
          message: 'VOTE YES',
          countryCode: 'AU',
          serviceType: 'Voting Service'
        }
      ];
      
      smsLogData.forEach(data => this.createSMSLog(data));
      
      // Create more random SMS logs for data volume
      for (let i = 0; i < 30; i++) {
        const numberId = Math.floor(Math.random() * 5) + 1;
        const number = this.numbers.get(numberId);
        
        if (number && number.type === 'SMS') {
          const messageLength = Math.floor(Math.random() * 100) + 5;
          const revenue = parseFloat((number.ratePerSMS || 1).toFixed(2));
          
          this.createSMSLog({
            numberId,
            messageLength,
            revenue,
            senderNumber: `+${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 10000000000)}`,
            message: 'Sample message content',
            countryCode: number.countryCode,
            serviceType: number.serviceType
          });
        }
      }
    };
    
    // Generate user messages
    const generateUserMessages = () => {
      const userMessageData: InsertUserMessage[] = [
        {
          numberId: 1,
          message: 'Need help with my account please',
          senderNumber: '+44 7123 456789',
          isRead: false,
          status: 'pending'
        },
        {
          numberId: 2,
          message: 'How do I cancel my subscription?',
          senderNumber: '+44 7234 567890',
          isRead: true,
          status: 'responded'
        },
        {
          numberId: 3,
          message: 'Request for a refund',
          senderNumber: '+1 212 555 1234',
          isRead: false,
          status: 'pending'
        }
      ];
      
      userMessageData.forEach(data => this.createUserMessage(data));
    };
    
    // Generate API integrations
    const generateApiIntegrations = () => {
      const apiIntegrationData: InsertApiIntegration[] = [
        {
          name: 'Twilio Integration',
          provider: 'Twilio',
          apiKey: process.env.TWILIO_API_KEY || 'twilio_api_key_placeholder',
          endpoint: 'https://api.twilio.com/2010-04-01',
          isActive: true,
          configuration: { accountSid: 'AC1234567890', authToken: 'auth_token_placeholder' }
        },
        {
          name: 'Infobip SMS Gateway',
          provider: 'Infobip',
          apiKey: process.env.INFOBIP_API_KEY || 'infobip_api_key_placeholder',
          endpoint: 'https://api.infobip.com/sms/1',
          isActive: true,
          configuration: { username: 'infobip_user', password: 'infobip_pass' }
        },
        {
          name: 'Nexmo Voice API',
          provider: 'Nexmo',
          apiKey: process.env.NEXMO_API_KEY || 'nexmo_api_key_placeholder',
          endpoint: 'https://api.nexmo.com/v1',
          isActive: false,
          configuration: { apiSecret: 'api_secret_placeholder' }
        }
      ];
      
      apiIntegrationData.forEach(data => this.createApiIntegration(data));
    };
    
    // Generate settings
    const generateSettings = () => {
      const settingData: InsertSetting[] = [
        {
          key: 'notification_email',
          value: 'admin@example.com',
          category: 'notifications',
          description: 'Email address for system notifications'
        },
        {
          key: 'sms_api_provider',
          value: 'twilio',
          category: 'integrations',
          description: 'Default SMS API provider'
        },
        {
          key: 'voice_api_provider',
          value: 'infobip',
          category: 'integrations',
          description: 'Default Voice API provider'
        },
        {
          key: 'default_currency',
          value: 'USD',
          category: 'billing',
          description: 'Default currency for billing'
        }
      ];
      
      settingData.forEach(data => this.createSetting(data));
    };
    
    // Run generators
    generateCallLogs();
    generateSMSLogs();
    generateUserMessages();
    generateApiIntegrations();
    generateSettings();
  }
}

export const storage = new MemStorage();
