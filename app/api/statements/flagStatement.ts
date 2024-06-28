"use server";

import type { FlaggedStatement } from "@/db/schema";
import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { safeUserId } from "@/utils/clerk";
import { getSessionId } from "@/utils/session";
import { refreshPoll } from "../lib/refreshPoll";

export const flagStatement = async (
  statementId: number,
  data: Pick<FlaggedStatement, "reason" | "description">,
  sessionId: string = getSessionId(),
) => {
  const userId = await safeUserId();

  const statement = await db
    .selectFrom("statements")
    .selectAll()
    .where("id", "=", statementId)
    .executeTakeFirst();

  if (!statement) {
    notFound();
  }

  await db
    .insertInto("flagged_statements")
    .values({
      statementId: statement.id,
      user_id: userId,
      session_id: sessionId,
      ...data,
    })
    .execute();

  await refreshPoll(statement.poll_id);
};
