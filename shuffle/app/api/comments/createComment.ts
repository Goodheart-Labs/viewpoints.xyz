"use server";

import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";

import { refreshPoll } from "../lib/refreshPoll";

export const createComment = async (pollId: number, text: string) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  await prisma.comment.create({
    data: {
      pollId,
      text,
      userId,
      sessionId,
    },
  });

  await refreshPoll(pollId);
};
