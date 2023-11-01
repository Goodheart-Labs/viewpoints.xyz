"use server";

import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import type { Response } from "@/db/schema";
import { db } from "@/db/client";
import { refreshPoll } from "../lib/refreshPoll";

export const createResponse = async (
  statementId: number,
  answer:
    | {
        type: "choice";
        choice: Response["choice"];
      }
    | {
        type: "customOption";
        customOptionId: number;
      },
) => {
  const { userId } = auth();
  const sessionId = cookies().get(SESSION_ID_COOKIE_NAME)!.value;

  const statement = await db
    .selectFrom("statements")
    .selectAll()
    .where("id", "=", statementId)
    .executeTakeFirst();

  if (!statement) {
    notFound();
  }

  if (answer.type === "choice") {
    await db
      .insertInto("responses")
      .values({
        user_id: userId,
        statementId,
        session_id: sessionId,
        choice: answer.choice,
      })
      .execute();
  } else {
    await db
      .insertInto("responses")
      .values({
        user_id: userId,
        statementId,
        session_id: sessionId,
        option_id: answer.customOptionId,
      })
      .execute();
  }

  await refreshPoll(statement.poll_id);
};
