import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { auth, currentUser } from "@clerk/nextjs";
import { polls_visibility_enum } from "@prisma/client";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// GET /api/polls/:id/comments
// -----------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) {
  const comments = await prisma.comments.findMany({
    where: {
      poll_id: Number(id),
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return NextResponse.json(comments);
}

// POST /api/polls/:id/comments
// -----------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) {
  const { userId } = auth();
  const user = await currentUser();

  const poll = await prisma.polls.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (
    !userId ||
    !poll ||
    (poll.visibility === polls_visibility_enum.private &&
      poll.user_id !== userId)
  ) {
    return notFound();
  }

  const body = await request.json();

  const response = await prisma.comments.create({
    data: {
      poll_id: parseInt(id),
      user_id: userId,
      session_id:
        request.cookies.get(SESSION_ID_COOKIE_NAME)?.value ??
        body.session_id ??
        null,
      edited_from_id: body.edited_from_id ?? null,
      author_name:
        body.author_name ??
        (user?.firstName ? `${user.firstName} ${user.lastName}` : null) ??
        null,
      author_avatar_url:
        body.author_avatar_url ?? user?.profileImageUrl ?? null,
      comment: body.comment,
      created_at: new Date(),
    },
  });

  return NextResponse.json(response);
}
