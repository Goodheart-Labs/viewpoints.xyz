import type { Poll } from "@/db/schema";
import { currentUser, auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const isPollAdmin = (
  poll: Poll | null | undefined,
  userId: string | null | undefined,
): poll is Poll => Boolean(userId && poll && poll.user_id === userId);

export const requirePollAdmin = async (poll: Poll | null): Promise<boolean> => {
  console.log("requirePollAdmin");

  console.log("requirePollAdmin:auth", await auth());
  const user = await currentUser();
  console.log("requirePollAdmin:currentUser", { user });

  if (!user) {
    console.log("requirePollAdmin - no user, notFound");
    return notFound();
  }

  console.log("requirePollAdmin - is user super admin or poll admin?", {
    isSuperAdmin: user.publicMetadata.isSuperAdmin,
    isPollAdmin: isPollAdmin(poll, user.id),
  });

  if (user.publicMetadata.isSuperAdmin || isPollAdmin(poll, user.id)) {
    console.log("requirePollAdmin - user is super admin or poll admin, true");

    return true;
  }

  console.log(
    "requirePollAdmin - user is not super admin or poll admin, notFound",
  );

  return notFound();
};
