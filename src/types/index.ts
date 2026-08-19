import type { Request } from 'express';
export type AuthenticatedRequest = Request;
export function requestUserId(req: AuthenticatedRequest): string { return req.session?.userId ?? ''; }
declare global { namespace Express { interface User { id: string; name: string; email: string; avatar: string | null } } }