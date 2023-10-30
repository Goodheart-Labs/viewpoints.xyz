"use server";

import { auth } from "@clerk/nextjs";
import type { FlaggedStatement } from "@/db/schema";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { refreshPoll } from "../lib/refreshPoll";

export const flagStatement = async (
  statementId: number,
  data: Pick<FlaggedStatement, "reason" | "description">,
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
    .insertInto("FlaggedStatement")
    .values({
      statementId: statement.id,
      user_id: userId,
      session_id: sessionId,
      ...data,
    })
    .execute();

  await refreshPoll(statement.poll_id);
};
