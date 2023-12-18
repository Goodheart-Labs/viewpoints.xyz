import { authMiddleware } from "@clerk/nextjs/server";

// Config
// -----------------------------------------------------------------------------

const pollSlug = "([a-z0-9-]+)";

const publicRoutes = [
  `/`,
  `/embed/polls/${pollSlug}`,
  `/polls/${pollSlug}`,
  `/polls/${pollSlug}/results`,
  `/api/sessions`,
  `/api/polls/${pollSlug}`,
];

export const SESSION_ID_COOKIE_NAME = "sessionId";
export const CLEAR_LOCALSTORAGE_HEADER_NAME = "X-Clear-LocalStorage";
export const AFTER_DEPLOY_COOKIE_NAME = "afterDeployWipe20231218";

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// Auth middleware
// -----------------------------------------------------------------------------

export default authMiddleware({
  debug: true,

  publicRoutes,
});
