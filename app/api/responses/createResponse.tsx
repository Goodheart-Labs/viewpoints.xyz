"use server";

import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import type { Response } from "@/db/schema";
import { db } from "@/db/client";
import { refreshPoll } from "../lib/refreshPoll";

export const createResponse = async (
  statementId: number,
  choice: Response["choice"],
) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  const statement = await db
    .selectFrom("Statement")
    .selectAll()
    .where("id", "=", statementId)
    .executeTakeFirst();

  if (!statement) {
    notFound();
  }

  await db
    .insertInto("responses")
    .values({
      statementId,
      session_id: sessionId,
      user_id: userId,
      choice,
    })
    .execute();

  await refreshPoll(statement.poll_id);
};
