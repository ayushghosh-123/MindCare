import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', // keep home public
]);

export default clerkMiddleware(async (auth, req) => {
  // 1️⃣ Protect authenticated pages
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 2️⃣ Prevent logged-in users from visiting auth pages
  if (isPublicRoute(req) && req.nextUrl.pathname !== '/') {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 3️⃣ Continue normally
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
