import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const isPublicRoute = createRouteMatcher([
  "/",
  "/polls/(.*)",
  "/api/polls/(.*)",
  "/api/public/(.*)",
  "/api/visitor",
  "/privacy-policy",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/embed/polls/(.*)",
]);

export default clerkMiddleware((auth, req) => {
  try {
    if (!isPublicRoute(req)) {
      auth().protect();
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const visitorIdCookie = req.cookies.get("visitorId");

  const res = NextResponse.next();

  if (req.nextUrl.searchParams.get("removeVisitorId")) {
    res.cookies.delete("visitorId");
  } else if (!visitorIdCookie) {
    res.cookies.set({
      name: "visitorId",
      value: auth().userId || uuidv4(),
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    res.headers.set("x-pathname", req.nextUrl.pathname);
  }

  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
