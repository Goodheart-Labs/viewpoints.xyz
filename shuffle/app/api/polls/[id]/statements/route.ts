import { auth, currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
  const { userId } = auth();
  const user = await currentUser();

  const poll = await prisma.polls.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  requirePollAdminIfPollIsPrivate(poll, userId);

  const body = await request.json();

  const response = await prisma.statement.create({
    data: {
      poll_id: parseInt(id),
      user_id: userId,
      session_id:
        request.cookies.get(SESSION_ID_COOKIE_NAME)?.value ??
        body.session_id ??
        null,
      author_name:
        body.author_name ??
        (user?.firstName ? `${user.firstName} ${user.lastName}` : null) ??
        null,
      author_avatar_url:
        body.author_avatar_url ?? user?.profileImageUrl ?? null,
      text: body.statement,
      created_at: new Date(),
    },
  });

  return NextResponse.json(response);
}
