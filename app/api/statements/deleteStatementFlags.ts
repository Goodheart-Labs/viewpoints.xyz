"use server";

import { auth } from "@clerk/nextjs";
import { requirePollAdmin } from "@/utils/authutils";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const deleteStatementFlags = async (
  pollId: number,
  statementId: number,
) => {
  const { userId } = auth();

  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirst();

  if (!poll) {
    notFound();
  }

  requirePollAdmin(poll, userId);

  await db
    .deleteFrom("flagged_statements")
    .where("statementId", "=", statementId)
    .execute();

  await refreshPoll(pollId);
};
