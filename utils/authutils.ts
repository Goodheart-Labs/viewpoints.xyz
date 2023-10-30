import type { Poll } from "@/db/schema";
import { notFound } from "next/navigation";

export const isPollAdmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
): poll is Poll => Boolean(userId && poll && poll.user_id === userId);

export const requirePollAdmin = (
  poll: Poll | null,
  userId: string | null | undefined,
): poll is Poll => {
  if (isPollAdmin(poll, userId)) {
    return true;
  }

  return notFound();
};
