"use server";

import { db } from "@/db/client";
import { currentUser } from "@clerk/nextjs/server";

export const createAuthorIfNeeded = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const author = await db
    .selectFrom("authors")
    .selectAll()
    .where("userId", "=", user.id)
    .executeTakeFirst();

  if (!author) {
    await db
      .insertInto("authors")
      .values({
        userId: user.id,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Anonymous",
        avatarUrl: user.imageUrl,
      })
      .execute();
  }
};
