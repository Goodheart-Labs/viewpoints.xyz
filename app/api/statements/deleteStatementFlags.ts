"use server";

import { auth } from "@clerk/nextjs";

import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";

import { refreshPoll } from "../lib/refreshPoll";

export const deleteStatementFlags = async (
  pollId: number,
  statementId: number,
) => {
  const { userId } = auth();

  const poll = await prisma.polls.findUnique({
    where: { id: pollId },
  });

  requirePollAdmin(poll, userId);

  await prisma.flaggedStatement.deleteMany({
    where: {
      statementId,
    },
  });

  await refreshPoll(pollId);
};
