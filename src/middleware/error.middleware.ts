import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
	logger.error('request-error', error);
	if (error instanceof ZodError) return res.status(400).json({ success: false, message: error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; ') });
	const message = error instanceof Error ? error.message : 'Internal server error';
	return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? message : 'Internal server error' });
};