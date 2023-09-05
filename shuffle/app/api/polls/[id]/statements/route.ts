import { currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createAuthorIfNeeded } from "@/app/api/lib/createAuthorIfNeeded";
import type { CreateStatementBody } from "@/lib/api";
import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

// GET /api/polls/:id/statements
// -----------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const statements = await prisma.statement.findMany({
    where: {
      poll_id: Number(id),
    },
    orderBy: {
      created_at: "asc",
    },
    include: {
      author: true,
    },
  });

  return NextResponse.json(statements);
}

// POST /api/polls/:id/statements
// -----------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const user = await currentUser();

  const poll = await prisma.polls.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  requirePollAdminIfPollIsPrivate(poll, user?.id);

  const body = (await request.json()) as CreateStatementBody;

  createAuthorIfNeeded();

  const response = await prisma.statement.create({
    data: {
      poll_id: parseInt(id),
      user_id: user?.id,
      session_id: request.cookies.get(SESSION_ID_COOKIE_NAME)?.value,
      text: body.text,
      created_at: new Date(),
    },
  });

  return NextResponse.json(response);
}
