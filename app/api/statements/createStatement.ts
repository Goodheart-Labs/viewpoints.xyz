"use server";

import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";

import { createAuthorIfNeeded } from "../lib/createAuthorIfNeeded";
import { refreshPoll } from "../lib/refreshPoll";

export const createStatement = async (pollId: number, text: string) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  await createAuthorIfNeeded();

  await prisma.statement.create({
    data: {
      poll_id: pollId,
      user_id: userId,
      session_id: sessionId,
      text,
      created_at: new Date(),
    },
  });

  await refreshPoll(pollId);
};
