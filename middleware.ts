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
const INFINITE_REDIRECTION_LOOP_COOKIE = "__clerk_redirection_loop";
const CLERK_CLIENT_UAT_COOKIE = "__client_uat";

export const config = {
  matcher: ["/((?!.*\\..*|_next|iframe).*)", "/'"],
};

// Auth middleware
// -----------------------------------------------------------------------------

export default authMiddleware({
  beforeAuth: (req) => {
    const redirectCount = req.cookies.get(INFINITE_REDIRECTION_LOOP_COOKIE)
      ?.value;

    if (redirectCount) {
      req.cookies.delete(CLERK_CLIENT_UAT_COOKIE);
      req.cookies.delete(INFINITE_REDIRECTION_LOOP_COOKIE);

      return NextResponse.redirect(new URL("/", req.url));
    }

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
