import { authMiddleware } from "@clerk/nextjs/server";

// Config
// -----------------------------------------------------------------------------

const publicRoutes = [
  "/embed/polls/(.*)",
  "/polls/(.*)",
  "/polls/(.*)/results",
  "/api/sessions",
  "/api/polls/(.*)",
];

export const SESSION_ID_COOKIE_NAME = "sessionId";
export const CLEAR_LOCALSTORAGE_HEADER_NAME = "X-Clear-LocalStorage";
export const AFTER_DEPLOY_COOKIE_NAME = "afterDeployWipe20231126";

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// Auth middleware
// -----------------------------------------------------------------------------

export default authMiddleware({
  debug: true,

  publicRoutes,
});
