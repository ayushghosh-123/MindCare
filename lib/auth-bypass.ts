import { verifyToken } from '@clerk/backend';

export async function getVerifiedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  
  if (!token) {
    console.error("[Auth Bypass] No token provided in Authorization header.");
    return null;
  }

  try {
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY as string,
    });
    return verified.sub || null;
  } catch (err: any) {
    console.error(`[Auth Bypass] verifyToken failed: ${err.message}`);
    return null;
  }
}
