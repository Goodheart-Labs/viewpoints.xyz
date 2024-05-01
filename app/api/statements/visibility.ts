"use server";

import { db } from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { requirePollAdmin } from "@/utils/authutils";
import { refreshPoll } from "../lib/refreshPoll";

export const hideStatement = async (statementId: number, pollId: number) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirstOrThrow();

  await requirePollAdmin(poll);

  await db
    .updateTable("statements")
    .set({
      visible: false,
    })
    .where("id", "=", statementId)
    .executeTakeFirst();

  await refreshPoll(pollId);
};

export const showStatement = async (statementId: number, pollId: number) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirstOrThrow();

  await requirePollAdmin(poll);

  await db
    .updateTable("statements")
    .set({
      visible: true,
    })
    .where("id", "=", statementId)
    .executeTakeFirst();

  await refreshPoll(pollId);
};
