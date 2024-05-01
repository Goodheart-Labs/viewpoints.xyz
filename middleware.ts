import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

// Config
// -----------------------------------------------------------------------------

const pollSlug = "([a-z0-9-]+)";

const publicRoutes = [
  `/`,
  `/polls/${pollSlug}`,
  `/polls/${pollSlug}/results`,
  `/api/sessions`,
  `/privacy-policy`,
];
const isPublicRoute = createRouteMatcher(publicRoutes);

const ignoredRoutes = [`/embed/polls/${pollSlug}`, `/api/polls/${pollSlug}`];
const isIgnoredRoute = createRouteMatcher(ignoredRoutes);

export const SESSION_ID_COOKIE_NAME = "sessionId";
export const CLEAR_LOCALSTORAGE_HEADER_NAME = "X-Clear-LocalStorage";
export const AFTER_DEPLOY_COOKIE_NAME = "afterDeployWipe20231218";

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// Auth middleware
// -----------------------------------------------------------------------------

export default clerkMiddleware(
  (auth, request) => {
    if (!isIgnoredRoute(request) && !isPublicRoute(request)) {
      auth().protect();
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    secretKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
);
