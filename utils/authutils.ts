import type { Poll } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const isPollAdmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
): poll is Poll => Boolean(userId && poll && poll.user_id === userId);

export const isPollAdminOrSuperadmin = async (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
) => {
  const user = await currentUser();

  if (!user) {
    return false;
  }

  if (user.publicMetadata.isSuperAdmin || isPollAdmin(poll, userId)) {
    return true;
  }

  return false;
};

export const requirePollAdmin = async (poll: Poll | null): Promise<boolean> => {
  const user = await currentUser();
  const canEditPoll = await isPollAdminOrSuperadmin(poll, user?.id);

  if (canEditPoll) {
    return true;
  }

  return notFound();
};
