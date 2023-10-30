"use server";

import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import type { Response } from "@/db/schema";
import { refreshPoll } from "../lib/refreshPoll";

export const createResponse = async (
  statementId: number,
  choice: Response["choice"],
) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  const statement = await prisma.statement.findUnique({
    where: {
      id: statementId,
    },
  });

  if (!statement) {
    notFound();
  }

  await prisma.responses.create({
    data: {
      statementId,
      session_id: sessionId,
      user_id: userId,
      choice,
    },
  });

  await refreshPoll(statement.poll_id);
};
