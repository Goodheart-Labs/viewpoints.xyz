import { cookies } from "next/headers";

/**
 * Returns the unique visitor id for the current user on the server.
 */
export const getVisitorId = () => {
  const visitorId = cookies().get("__visitor_id")?.value;
  if (!visitorId) throw new Error("No visitor id found");
  return visitorId;
};
