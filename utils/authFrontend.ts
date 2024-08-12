import type { Poll } from "@/db/schema";
import { useUser } from "@clerk/nextjs";

export const useIsSuperuser = () => {
  const { user } = useUser();
  return Boolean(user?.publicMetadata.isSuperAdmin);
};

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
