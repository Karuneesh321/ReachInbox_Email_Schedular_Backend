import { Router } from 'express';
import { detail, schedule, scheduled, sent } from '../controllers/email.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
export const emailRouter = Router(); emailRouter.use(requireAuth); emailRouter.post('/schedule', schedule); emailRouter.get('/scheduled', scheduled); emailRouter.get('/sent', sent); emailRouter.get('/:id', detail);