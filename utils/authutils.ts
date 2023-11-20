import type { Poll } from "@/db/schema";
import { currentUser } from "@clerk/nextjs";
import { notFound } from "next/navigation";

export const isPollAdmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
): poll is Poll => Boolean(userId && poll && poll.user_id === userId);

export const requirePollAdmin = async (poll: Poll | null): Promise<boolean> => {
  const user = await currentUser();
  if (!user) {
    return notFound();
  }

  if (user.publicMetadata.isSuperAdmin || isPollAdmin(poll, user.id)) {
    return true;
  }

  return notFound();
};
