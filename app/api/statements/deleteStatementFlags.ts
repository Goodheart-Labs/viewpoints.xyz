"use server";

import { requirePollAdmin } from "@/utils/authutils";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const deleteStatementFlags = async (
  pollId: number,
  statementId: number,
) => {
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirst();

  if (!poll) {
    notFound();
  }

  await requirePollAdmin(poll);

  await db
    .deleteFrom("flagged_statements")
    .where("statementId", "=", statementId)
    .execute();

  await refreshPoll(pollId);
};
