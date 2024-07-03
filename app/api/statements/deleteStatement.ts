"use server";

import { requirePollAdmin } from "@/utils/auth";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const deleteStatement = async (pollId: number, statementId: number) => {
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirst();

  if (!poll) {
    notFound();
  }

  await requirePollAdmin(poll);

  await db.deleteFrom("statements").where("id", "=", statementId).execute();

  await refreshPoll(pollId);
};
