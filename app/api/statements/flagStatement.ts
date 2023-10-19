"use server";

import { auth } from "@clerk/nextjs";
import type { FlaggedStatement } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";

import { refreshPoll } from "../lib/refreshPoll";

export const flagStatement = async (
  statementId: number,
  data: Pick<FlaggedStatement, "reason" | "description">,
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

  await prisma.flaggedStatement.create({
    data: {
      statementId: statement.id,
      user_id: userId,
      session_id: sessionId,
      ...data,
    },
  });

  await refreshPoll(statement.poll_id);
};
