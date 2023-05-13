import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes(_req) {
    return true;
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/'"],
};
