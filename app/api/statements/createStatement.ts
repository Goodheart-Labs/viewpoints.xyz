"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";
import { refreshPoll } from "../lib/refreshPoll";

export const createStatement = async (pollId: number, text: string) => {
  const { userId, sessionId } = auth();

  await createAuthorIfNeeded();

  // get poll
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirstOrThrow();

  await db
    .insertInto("statements")
    .values({
      poll_id: pollId,
      user_id: userId,
      session_id: sessionId,
      visible: poll.new_statements_visible_by_default,
      text,
    })
    .execute();

  await refreshPoll(pollId);
};
