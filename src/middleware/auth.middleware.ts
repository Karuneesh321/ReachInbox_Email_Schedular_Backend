import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) { if (!req.session?.userId) return res.status(401).json({ success: false, message: 'Authentication required' }); next(); }