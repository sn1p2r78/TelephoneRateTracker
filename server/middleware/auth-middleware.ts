import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Define role hierarchy for authorization checks
const roleHierarchy = {
  admin: ['admin', 'support', 'user', 'test'],
  support: ['support', 'user', 'test'],
  user: ['user', 'test'],
  test: ['test']
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check if user has the required role
export const hasRole = (roles: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const userRole = req.user?.role || 'user';

    // Check if user's role is allowed to access
    const hasPermission = allowedRoles.some(role => 
      roleHierarchy[role as keyof typeof roleHierarchy]?.includes(userRole)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if the user has access to a specific number
export const hasNumberAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user?.id;
    const numberId = parseInt(req.params.id);

    if (!userId || !numberId || isNaN(numberId)) {
      return res.status(400).json({ error: 'Invalid user or number ID' });
    }

    const userRole = req.user?.role || 'user';
    
    // Admins and support can access all numbers
    if (userRole === 'admin' || userRole === 'support') {
      return next();
    }

    // Get numbers assigned to this user
    const userNumbers = await storage.getUserNumbers(userId);
    const hasAccess = userNumbers.some(number => number.id === numberId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this number' });
    }

    next();
  };
};

// Middleware to check if the user is interacting with their own account
export const isSelfOrHigherRole = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const targetUserId = parseInt(req.params.id);
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role || 'user';

    // Self-check
    if (requestingUserId === targetUserId) {
      return next();
    }

    // Role-based check
    if ((requestingUserRole === 'admin') || 
        (requestingUserRole === 'support' && req.method !== 'DELETE')) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};