import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

const isPublicRoute = createRouteMatcher([
  "/",
  "/polls/(.*)",
  "/api/public/(.*)",
  "/privacy-policy",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(
  (auth, request) => {
    if (!isPublicRoute(request)) {
      auth().protect();
    }

    return visitorMiddleware(request);
  },
  { debug: true },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

function visitorMiddleware(request: NextRequest) {
  try {
    const requestHeaders = new Headers(request.headers);

    // If there is no visitor id on the request header, set it
    if (!requestHeaders.get("x-visitor-id")) {
      // Use the visitor id from the cookie if it exists
      const visitorId = request.cookies.get("__visitor_id")?.value;

      requestHeaders.set("x-visitor-id", visitorId || uuidv4());
    }

    return NextResponse.next({
      request: {
        ...request,
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in visitorMiddleware:", error);
    // Return the original request without modification in case of error
    return NextResponse.next();
  }
}
