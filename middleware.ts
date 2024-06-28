import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/polls/(.*)",
  "/api/sessions",
  "/privacy-policy",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

console.log(`Hello world!`);

export default clerkMiddleware();

// export default clerkMiddleware((auth, request) => {
//   if (!isPublicRoute(request)) {
//     auth().protect();
//   }
// });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

export const AFTER_DEPLOY_COOKIE_NAME = "afterDeployWipe20231218";
