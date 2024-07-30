"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Returns the unique visitor id for the current user or generates a new one if none is found.
 */
export const getVisitorId = async () => {
  const { userId } = auth();
  const visitorId = userId || cookies().get("visitorId")?.value;
  if (!visitorId) throw new Error("No visitor id found");
  return visitorId;
};
