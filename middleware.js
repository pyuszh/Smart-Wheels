import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Public vs Protected routes
const isPublicRoute = createRouteMatcher([
  "/", 
  "/sign-in(.*)", 
  "/sign-up(.*)",
  "/api/webhook/clerk"
]);

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/saved-cars(.*)",
  "/reservations(.*)",
  "/test-drive(.*)", // Fixed typo from 'ddrive'
]);

// 2. Configure Arcjet Security
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

// 3. Define Clerk Authentication Logic
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is not logged in and tries to access a protected route
  if (!userId && isProtectedRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  return NextResponse.next();
});

// 4. Export the chained middleware
export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};