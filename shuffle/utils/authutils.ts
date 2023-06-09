import { Poll } from "@/lib/api";
import { polls_visibility_enum } from "@prisma/client";
import { notFound } from "next/navigation";

export const isPollAdmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined
): poll is Poll => Boolean(userId && poll && poll.user_id === userId);

export const requirePollAdmin = (
  poll: Poll | null,
  userId: string | null
): poll is Poll => {
  if (isPollAdmin(poll, userId)) {
    return true;
  }

  notFound();

  return false;
};

export const requirePollAdminIfPollIsPrivate = (
  poll: Poll | null,
  userId: string | null
): poll is Poll => {
  if (poll && poll.visibility !== polls_visibility_enum.private) {
    return true;
  }

  requirePollAdmin(poll, userId);

  return false;
};
