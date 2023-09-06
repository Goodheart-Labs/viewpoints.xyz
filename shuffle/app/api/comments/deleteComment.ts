"use server";

import { auth } from "@clerk/nextjs";

import prisma from "@/lib/prisma";

import { refreshPoll } from "../lib/refreshPoll";

export const deleteComment = async (id: number) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
    },
  });

  if (!comment) {
    return;
  }

  const { userId } = auth();

  if (comment.userId !== userId) {
    return;
  }

  await prisma.comment.delete({
    where: {
      id,
    },
  });

  await refreshPoll(comment.pollId);
};
