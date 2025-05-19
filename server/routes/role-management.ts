import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, hasRole } from '../middleware/auth-middleware';
import { db } from '../db';
import { userNumbers, numbers, userMessages, smsLogs, callLogs } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

const router = Router();

// Get account information based on role
router.get('/account-info', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get assigned numbers count
    const assignedNumbers = await storage.getUserNumbers(userId);
    
    // Basic account info for all roles
    const accountInfo = {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
      paymentMethod: user.paymentMethod,
      balance: user.balance,
      status: user.status,
      assignedNumbersCount: assignedNumbers.length,
    };
    
    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: 'Failed to fetch account information' });
  }
});

// Get test account numbers (5 from each range)
router.get('/test-account/numbers', isAuthenticated, hasRole('test'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }
    
    // Get test numbers assigned to this user
    const userTestNumbers = await db.select({
      number: numbers
    })
    .from(userNumbers)
    .innerJoin(numbers, eq(userNumbers.numberId, numbers.id))
    .where(and(
      eq(userNumbers.userId, userId),
      eq(userNumbers.isTest, true)
    ));
    
    res.json(userTestNumbers);
  } catch (error) {
    console.error('Error fetching test account numbers:', error);
    res.status(500).json({ error: 'Failed to fetch test account numbers' });
  }
});

// Admin/Support: Get all users
router.get('/admin/users', isAuthenticated, hasRole(['admin', 'support']), async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin/Support: Get all user CDIR (Call Detail Records)
router.get('/admin/cdir', isAuthenticated, hasRole(['admin', 'support']), async (req: Request, res: Response) => {
  try {
    // Get all message history records for admin view
    const messageHistory = await storage.getAllMessageHistory();
    res.json(messageHistory);
  } catch (error) {
    console.error('Error fetching CDIR records:', error);
    res.status(500).json({ error: 'Failed to fetch CDIR records' });
  }
});

// Admin/Support: Generate payment reports
router.get('/admin/payment-reports', isAuthenticated, hasRole(['admin', 'support']), async (req: Request, res: Response) => {
  try {
    // Fetch all payouts for reporting
    const payouts = await storage.getAllPayouts();
    res.json(payouts);
  } catch (error) {
    console.error('Error generating payment reports:', error);
    res.status(500).json({ error: 'Failed to generate payment reports' });
  }
});

// Regular User: Get personal CDIR
router.get('/user/cdir', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }
    
    // Get user numbers first
    const userNumberList = await storage.getUserNumbers(userId);
    
    if (userNumberList.length === 0) {
      return res.json([]);
    }
    
    // Get message history for these numbers
    const numberValues = userNumberList.map(number => number.value);
    const messageHistory = await storage.getMessageHistoryByNumbers(numberValues);
    
    res.json(messageHistory);
  } catch (error) {
    console.error('Error fetching user CDIR:', error);
    res.status(500).json({ error: 'Failed to fetch user CDIR' });
  }
});

// Add a mock implementation for getting message history by numbers until we implement it properly
storage.getMessageHistoryByNumbers = async (numberValues: string[]) => {
  // This is a temporary implementation until we add this method properly to the storage interface
  const messageHistoryResults = [];
  
  for (const value of numberValues) {
    const history = await storage.getMessageHistoryByNumber(value);
    messageHistoryResults.push(...history);
  }
  
  return messageHistoryResults;
};

export default router;