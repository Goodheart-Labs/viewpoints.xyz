"use server";

import { notFound } from "next/navigation";
import type { Response } from "@/db/schema";
import { db } from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { getVisitorId } from "@/lib/getVisitorId";
import { refreshPoll } from "../lib/refreshPoll";

/**
 * Creates a response for a statement.
 */
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
  const { userId: user_id, sessionId: authSessionId } = auth();
  const visitorId = getVisitorId();

  const session_id = authSessionId || visitorId;

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
        user_id,
        statementId,
        session_id,
        choice: answer.choice,
      })
      .execute();
  } else {
    await db
      .insertInto("responses")
      .values({
        user_id,
        statementId,
        session_id,
        option_id: answer.customOptionId,
      })
      .execute();
  }

  await refreshPoll(statement.poll_id);
};
