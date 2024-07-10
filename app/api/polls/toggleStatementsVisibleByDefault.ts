"use server";

import { requirePollAdmin } from "@/utils/auth";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const toggleNewStatementsVisibility = async (
  pollId: number,
  visibleByDefault: boolean,
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
    .updateTable("polls")
    .set({
      new_statements_visible_by_default: visibleByDefault,
    })
    .where("id", "=", pollId)
    .execute();

  await refreshPoll(pollId);
};
