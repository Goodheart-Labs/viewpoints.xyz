import type { Poll } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { isPollAdminOrSuperadmin } from "./authFrontend";

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
