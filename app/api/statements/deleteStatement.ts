"use server";

import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";
import { db } from "@/db/client";
import { notFound } from "next/navigation";
import { refreshPoll } from "../lib/refreshPoll";

export const deleteStatement = async (pollId: number, statementId: number) => {
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

  await prisma.statement.delete({
    where: { id: statementId },
  });

  await refreshPoll(pollId);
};