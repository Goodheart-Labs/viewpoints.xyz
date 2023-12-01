"use server";

import { auth } from "@clerk/nextjs";
import { db } from "@/db/client";
import { getSessionId } from "@/utils/sessionutils";
import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";
import { refreshPoll } from "../lib/refreshPoll";

export const createStatement = async (pollId: number, text: string) => {
  const { userId } = auth();
  const sessionId = getSessionId();

  await createAuthorIfNeeded();

  await db
    .insertInto("statements")
    .values({
      poll_id: pollId,
      user_id: userId,
      session_id: sessionId,
      text,
    })
    .execute();

  await refreshPoll(pollId);
};
