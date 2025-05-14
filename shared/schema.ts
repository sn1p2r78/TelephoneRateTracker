import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  role: text("role").notNull().default("admin"),
  paymentMethod: text("payment_method").default("usdt"), // usdt or bank
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  bankRoutingNumber: text("bank_routing_number"),
  usdtAddress: text("usdt_address"),
  balance: real("balance").default(0),
  status: text("status").default("active"), // active, suspended, pending
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  role: true,
  paymentMethod: true,
  bankAccountNumber: true,
  bankName: true,
  bankRoutingNumber: true,
  usdtAddress: true,
  status: true,
});

// Premium Rate Numbers
export const numbers = pgTable("numbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: text("number").notNull().unique(),
  value: text("value").notNull().unique(), // Full format of the number including country code, used for routing
  countryCode: text("country_code").notNull(),
  type: text("type").notNull(), // 'VOICE', 'SMS', 'COMBINED'
  serviceType: text("service_type").notNull(), // 'SUPPORT', 'ENTERTAINMENT', etc.
  ratePerMinute: real("rate_per_minute"),
  ratePerSMS: real("rate_per_sms"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNumberSchema = createInsertSchema(numbers).pick({
  name: true,
  number: true,
  value: true,
  countryCode: true,
  type: true,
  serviceType: true,
  ratePerMinute: true,
  ratePerSMS: true,
  isActive: true,
});

// Call Logs
export const callLogs = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  numberId: integer("number_id").notNull(),
  numberValue: text("number_value").notNull(),
  numberName: text("number_name"),
  caller: text("caller"),
  recipient: text("recipient"),
  callId: text("call_id"),
  duration: integer("duration").default(0), // in seconds
  revenue: real("revenue").default(0),
  status: text("status").default("UNKNOWN"), // RINGING, ANSWERED, COMPLETED, FAILED, etc.
  direction: text("direction").default("INBOUND"), // INBOUND, OUTBOUND
  providerName: text("provider_name"),
  recording: text("recording"), // URL to recording file
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  countryCode: text("country_code"),
  serviceType: text("service_type"),
});

export const insertCallLogSchema = createInsertSchema(callLogs).pick({
  numberId: true,
  numberValue: true,
  numberName: true,
  caller: true,
  recipient: true,
  callId: true,
  duration: true,
  revenue: true,
  status: true,
  direction: true,
  providerName: true,
  recording: true,
  startTime: true,
  endTime: true,
  countryCode: true,
  serviceType: true,
});

// SMS Logs
export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  numberId: integer("number_id").notNull(),
  numberValue: text("number_value").notNull(),
  numberName: text("number_name"),
  sender: text("sender"),
  recipient: text("recipient"),
  message: text("message"),
  messageId: text("message_id"),
  messageLength: integer("message_length"),
  revenue: real("revenue").default(0),
  status: text("status").default("UNKNOWN"), // RECEIVED, SENT, FAILED, DELIVERED, etc.
  direction: text("direction").default("INBOUND"), // INBOUND, OUTBOUND
  providerName: text("provider_name"),
  timestamp: timestamp("timestamp").defaultNow(),
  countryCode: text("country_code"),
  serviceType: text("service_type"),
});

export const insertSMSLogSchema = createInsertSchema(smsLogs).pick({
  numberId: true,
  numberValue: true,
  numberName: true,
  sender: true,
  recipient: true,
  message: true,
  messageId: true,
  messageLength: true,
  revenue: true,
  status: true,
  direction: true,
  providerName: true,
  timestamp: true,
  countryCode: true,
  serviceType: true,
});

// User Messages (from customers)
export const userMessages = pgTable("user_messages", {
  id: serial("id").primaryKey(),
  numberId: integer("number_id").notNull(),
  message: text("message").notNull(),
  senderNumber: text("sender_number"),
  isRead: boolean("is_read").notNull().default(false),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull().default("pending"), // pending, responded, archived
});

export const insertUserMessageSchema = createInsertSchema(userMessages).pick({
  numberId: true,
  message: true,
  senderNumber: true,
  isRead: true,
  status: true,
});

// API Integrations
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  integrationType: text("integration_type").notNull(), // 'smpp', 'http', 'api'
  apiKey: text("api_key"),
  baseUrl: text("base_url"),
  endpoint: text("endpoint"),
  config: text("config"), // JSON stringified configuration
  status: text("status").default("inactive"),
  isActive: boolean("is_active").notNull().default(true),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations).pick({
  name: true,
  provider: true,
  integrationType: true,
  apiKey: true,
  baseUrl: true,
  endpoint: true,
  config: true,
  isActive: true,
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  category: text("category").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
  category: true,
  description: true,
});

// Provider details
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serviceType: text("service_type").notNull(), // Premium Numbers, SMS & Voice APIs
  pricingDetails: text("pricing_details").notNull(),
  supportedCountries: text("supported_countries"),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProviderSchema = createInsertSchema(providers).pick({
  name: true,
  serviceType: true,
  pricingDetails: true,
  supportedCountries: true,
  website: true,
  contactEmail: true,
  contactPhone: true,
  notes: true,
  isActive: true,
});

// User payments/payouts
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  status: text("status").default("pending"), // pending, processing, completed, failed
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertPayoutSchema = createInsertSchema(payouts).pick({
  userId: true,
  amount: true,
  status: true,
  paymentMethod: true,
  transactionId: true,
  notes: true,
});

// Types for all schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Number = typeof numbers.$inferSelect;
export type InsertNumber = z.infer<typeof insertNumberSchema>;

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;

export type SMSLog = typeof smsLogs.$inferSelect;
export type InsertSMSLog = z.infer<typeof insertSMSLogSchema>;

export type UserMessage = typeof userMessages.$inferSelect;
export type InsertUserMessage = z.infer<typeof insertUserMessageSchema>;

export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = z.infer<typeof insertApiIntegrationSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

// Activity type for recent activity combined view
export type ActivityType = (CallLog | SMSLog) & {
  activityType: 'call' | 'sms';
  numberValue: string;
};
