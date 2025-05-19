import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { log } from "../vite";

// Create a router for user-specific data
const userRouter = Router();

// Get user dashboard data
userRouter.get("/dashboard", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Get user's active numbers count
    const userNumbers = await storage.getUserNumbers(userId);
    const activeNumbers = userNumbers.filter(n => n.isActive).length;
    
    // Get total calls
    const userCalls = await storage.getUserCallLogs(userId);
    const totalCalls = userCalls.length;
    
    // Get total SMS
    const userSMS = await storage.getUserSMSLogs(userId);
    const totalSMS = userSMS.length;
    
    // Calculate total revenue
    const callRevenue = userCalls.reduce((sum, call) => sum + (call.revenue || 0), 0);
    const smsRevenue = userSMS.reduce((sum, sms) => sum + (sms.revenue || 0), 0);
    const totalRevenue = callRevenue + smsRevenue;
    
    // Generate sample revenue history for chart
    // In a real app, this would come from database aggregation
    const revenueHistory = [
      { date: "Jan", voice: 320, sms: 240 },
      { date: "Feb", voice: 280, sms: 200 },
      { date: "Mar", voice: 420, sms: 320 },
      { date: "Apr", voice: 450, sms: 280 },
      { date: "May", voice: 520, sms: 350 },
    ];
    
    return res.json({
      activeNumbers,
      totalCalls,
      totalSMS,
      totalRevenue,
      callRevenue,
      smsRevenue,
      revenueHistory
    });
  } catch (error) {
    log(`Error getting user dashboard: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve dashboard data" });
  }
});

// Get user's recent activity (calls and SMS)
userRouter.get("/activity", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Get recent calls and SMS logs for the user
    const recentCalls = await storage.getUserCallLogs(userId, 10);
    const recentSMS = await storage.getUserSMSLogs(userId, 10);
    
    // Combine them into a single activity feed and sort by timestamp
    const callActivities = recentCalls.map(call => ({
      ...call,
      activityType: 'call',
      timestamp: call.startTime
    }));
    
    const smsActivities = recentSMS.map(sms => ({
      ...sms,
      activityType: 'sms',
      timestamp: sms.timestamp
    }));
    
    const allActivities = [...callActivities, ...smsActivities].sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 10);
    
    return res.json(allActivities);
  } catch (error) {
    log(`Error getting user activity: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve activity data" });
  }
});

// Get user payment profile
userRouter.get("/payment-profile", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = req.user;
    
    // Extract relevant payment fields from user
    const paymentProfile = {
      id: user.id,
      paymentMethod: user.paymentMethod,
      usdtAddress: user.usdtAddress,
      bankName: user.bankName,
      bankAccountNumber: user.bankAccountNumber,
      bankRoutingNumber: user.bankRoutingNumber,
      balance: user.balance || 0
    };
    
    return res.json(paymentProfile);
  } catch (error) {
    log(`Error getting payment profile: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve payment profile" });
  }
});

// Update user payment settings
userRouter.put("/payment-settings", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id;
    const { paymentMethod, usdtAddress, bankName, bankAccountNumber, bankRoutingNumber } = req.body;
    
    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }
    
    // Update user's payment settings
    const updateData: any = { paymentMethod };
    
    if (paymentMethod === "usdt") {
      if (!usdtAddress) {
        return res.status(400).json({ error: "USDT address is required" });
      }
      updateData.usdtAddress = usdtAddress;
      // Clear bank fields
      updateData.bankName = null;
      updateData.bankAccountNumber = null;
      updateData.bankRoutingNumber = null;
    } else if (paymentMethod === "bank") {
      if (!bankName || !bankAccountNumber || !bankRoutingNumber) {
        return res.status(400).json({ error: "All bank details are required" });
      }
      updateData.bankName = bankName;
      updateData.bankAccountNumber = bankAccountNumber;
      updateData.bankRoutingNumber = bankRoutingNumber;
      // Clear USDT fields
      updateData.usdtAddress = null;
    }
    
    const updatedUser = await storage.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Return sanitized response
    return res.json({
      success: true,
      message: "Payment settings updated successfully"
    });
  } catch (error) {
    log(`Error updating payment settings: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to update payment settings" });
  }
});

// Get user payment history
userRouter.get("/payment-history", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Get user's payouts and earnings
    const payouts = await storage.getUserPayouts(userId);
    
    // For earnings, we'd normally calculate from calls and SMS logs
    // This is a simplified version for the prototype
    const earnings = [
      {
        id: 1,
        type: 'call',
        number: '+123456789',
        duration: 120,
        amount: 2.40,
        date: '2025-05-01T10:30:00Z'
      },
      {
        id: 2,
        type: 'sms',
        number: '+123456789',
        messageCount: 5,
        amount: 1.25,
        date: '2025-05-02T14:15:00Z'
      },
      {
        id: 3,
        type: 'call',
        number: '+987654321',
        duration: 300,
        amount: 6.00,
        date: '2025-05-05T09:45:00Z'
      }
    ];
    
    return res.json({
      payouts,
      earnings
    });
  } catch (error) {
    log(`Error getting payment history: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve payment history" });
  }
});

// Get user's CDIR history (call and SMS history)
userRouter.get("/cdir", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = req.user.id;
    const { from, to, type, number, page = 1, limit = 20 } = req.query;
    
    // Parse date range if provided
    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;
    
    // Get call and SMS logs based on filters
    let callLogs: any[] = [];
    let smsLogs: any[] = [];
    
    if (!type || type === 'call' || type === 'all') {
      callLogs = await storage.getUserCallLogsFiltered(
        userId, 
        fromDate, 
        toDate, 
        number as string | undefined
      );
    }
    
    if (!type || type === 'sms' || type === 'all') {
      smsLogs = await storage.getUserSMSLogsFiltered(
        userId, 
        fromDate, 
        toDate, 
        number as string | undefined
      );
    }
    
    // Combine and format the logs
    const callActivities = callLogs.map(call => ({
      ...call,
      activityType: 'call',
      timestamp: call.startTime
    }));
    
    const smsActivities = smsLogs.map(sms => ({
      ...sms,
      activityType: 'sms',
      timestamp: sms.timestamp
    }));
    
    const allActivities = [...callActivities, ...smsActivities].sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });
    
    // Apply pagination
    const pageSize = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const startIdx = (pageNum - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedActivities = allActivities.slice(startIdx, endIdx);
    
    return res.json({
      data: paginatedActivities,
      total: allActivities.length,
      page: pageNum,
      pageSize,
      totalPages: Math.ceil(allActivities.length / pageSize),
      filters: {
        from: fromDate?.toISOString(),
        to: toDate?.toISOString(),
        type: type || 'all',
        number: number
      }
    });
  } catch (error) {
    log(`Error getting CDIR history: ${error instanceof Error ? error.message : String(error)}`, "api");
    return res.status(500).json({ error: "Failed to retrieve CDIR history" });
  }
});

export default userRouter;