"use server";

import { auth } from "@clerk/nextjs";
import { requirePollAdmin } from "@/utils/authutils";
import { db } from "@/db/client";
import type { Poll } from "@/db/schema";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const changeVisibility = async (
  pollId: number,
  visiblity: Poll["visibility"],
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

  // await prisma.polls.update({
  //   where: {
  //     id: pollId,
  //   },
  //   data: {
  //     visibility: visiblity,
  //   },
  // });

  await db
    .updateTable("polls")
    .set({
      visibility: visiblity,
    })
    .where("id", "=", pollId)
    .execute();

  await refreshPoll(pollId);
};
