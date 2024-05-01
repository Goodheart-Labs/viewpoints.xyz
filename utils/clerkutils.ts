import { currentUser } from "@clerk/nextjs/server";

export const safeUserId = async (): Promise<string | null> => {
  try {
    const user = await currentUser();
    const userId = user?.id ?? null;

    return userId;
  } catch (e) {
    return null;
  }
};
