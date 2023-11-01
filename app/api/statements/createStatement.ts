"use server";

import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { db } from "@/db/client";
import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";
import { refreshPoll } from "../lib/refreshPoll";

export const createStatement = async (pollId: number, text: string) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

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
