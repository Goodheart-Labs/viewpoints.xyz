"use server";

import { requirePollAdmin } from "@/utils/auth";
import { db } from "@/db/client";
import type { Poll } from "@/db/schema";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const changeVisibility = async (
  pollId: number,
  visiblity: Poll["visibility"],
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
      visibility: visiblity,
    })
    .where("id", "=", pollId)
    .execute();

  await refreshPoll(pollId);
};
