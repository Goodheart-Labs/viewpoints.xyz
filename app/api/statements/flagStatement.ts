"use server";

import type { FlaggedStatement } from "@/db/schema";
import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { getVisitorId } from "@/lib/getVisitorId";
import { refreshPoll } from "../lib/refreshPoll";

export const flagStatement = async (
  statementId: number,
  data: Pick<FlaggedStatement, "reason" | "description">,
) => {
  const { userId: user_id, sessionId } = auth();
  const visitorId = await getVisitorId();

  const session_id = sessionId || visitorId;

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
      statementId,
      user_id,
      session_id,
      ...data,
    })
    .execute();

  await refreshPoll(statement.poll_id);
};
