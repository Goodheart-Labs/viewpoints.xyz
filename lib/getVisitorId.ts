"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Returns the unique visitor id for the current user or generates a new one if none is found.
 */
export const getVisitorId = async () => {
  const { userId } = auth();
  const visitorId = userId || cookies().get("visitorId")?.value;
  if (!visitorId) {
    // refresh the page to generate a new visitor id
    redirect(headers().get("x-pathname") || "/");
  }
  return visitorId;
};
