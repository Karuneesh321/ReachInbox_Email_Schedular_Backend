import { Router } from 'express';
import passport from 'passport';
import { currentUser, googleCallback, logout } from '../controllers/auth.controller.js';
import { env } from '../config/env.js';
export const authRouter = Router();
authRouter.get('/me', currentUser); authRouter.post('/logout', logout);
authRouter.get('/google', (req, res, next) => {
	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return res.status(503).json({ success: false, message: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.' });
	return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=authentication' }), googleCallback);