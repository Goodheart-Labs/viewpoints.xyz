"use server";

import { auth } from "@clerk/nextjs";
import type { polls_visibility_enum } from "@prisma/client";

import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";

import { refreshPoll } from "../lib/refreshPoll";

export const changeVisibility = async (
  pollId: number,
  visiblity: polls_visibility_enum,
) => {
  const { userId } = auth();

  const poll = await prisma.polls.findUnique({
    where: {
      id: pollId,
    },
  });

  requirePollAdmin(poll, userId);

  await prisma.polls.update({
    where: {
      id: pollId,
    },
    data: {
      visibility: visiblity,
    },
  });

  await refreshPoll(pollId);
};
