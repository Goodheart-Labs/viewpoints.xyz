import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Config
// -----------------------------------------------------------------------------

const publicRoutes = ["/(.*)"];

export const SESSION_ID_COOKIE_NAME = "sessionId";

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
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
