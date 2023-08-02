import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Config
// -----------------------------------------------------------------------------

const publicRoutes = [
  "/",
  "/polls/(.*)",
  "/polls/(.*)/analytics",
  "/polls/(.*)/graphs",
];

const privateRoutes = ["/polls/new"];

export const SESSION_ID_COOKIE_NAME = "sessionId";

export const config = {
  matcher: ["/((?!.*\\..*|_next|iframe).*)", "/'"],
};

// Auth middleware
// -----------------------------------------------------------------------------

export default authMiddleware({
  beforeAuth: async (req) => {
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

  publicRoutes: (req) => {
    const isPrivateRoute = privateRoutes.some((r) =>
      new RegExp(r).test(req.nextUrl.pathname),
    );
    if (isPrivateRoute) {
      return false;
    }

    const isPublicRoute = publicRoutes.some((r) =>
      new RegExp(r).test(req.nextUrl.pathname),
    );
    if (isPublicRoute) {
      return true;
    }

    return false;
  },
});
