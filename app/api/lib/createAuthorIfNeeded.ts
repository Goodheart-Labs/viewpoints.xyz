"use server";

import { db } from "@/db/client";
import { currentUser } from "@clerk/nextjs";

export const createAuthorIfNeeded = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const author = await db
    .selectFrom("Author")
    .selectAll()
    .where("userId", "=", user.id)
    .executeTakeFirst();

  if (!author) {
    await db
      .insertInto("Author")
      .values({
        userId: user.id,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.emailAddresses[0].emailAddress,
        avatarUrl: user.imageUrl,
      })
      .execute();
  }
};
