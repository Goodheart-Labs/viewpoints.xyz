import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Config
// -----------------------------------------------------------------------------

const publicRoutes = [
  "/",
  "/polls/(.*)",
  "/embed/polls/(.*)",
  "/api/sessions",
  "/api/polls/(.*)",
];

export const SESSION_ID_COOKIE_NAME = "sessionId";

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};

// Auth middleware
// -----------------------------------------------------------------------------

export default authMiddleware({
  debug: true,

  beforeAuth: (req) => {
    if (!req.cookies.has(SESSION_ID_COOKIE_NAME)) {
      const newSessionId = uuidv4();
      const cookie = {
        name: SESSION_ID_COOKIE_NAME,
        value: newSessionId,
      };

      req.cookies.set(cookie);

      const response = NextResponse.next();
      response.cookies.set({ ...cookie, expires: Infinity });

      return response;
    }

    return NextResponse.next();
  },

  publicRoutes,
});
