import type { Poll } from "@/db/schema";
import { currentUser, User } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const isPollAdmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
): poll is Poll => Boolean(userId && poll && poll.user_id === userId);

export const isPollAdminOrSuperadmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
  isSuperAdmin: boolean,
) => {
  if (isSuperAdmin || isPollAdmin(poll, userId)) {
    return true;
  }

  return false;
};

export const requirePollAdmin = async (poll: Poll | null): Promise<boolean> => {
  const user = await currentUser();
  const canEditPoll = isPollAdminOrSuperadmin(
    poll,
    user?.id,
    user?.publicMetadata.isSuperAdmin as boolean,
  );

  if (canEditPoll) {
    return true;
  }

  return notFound();
};
