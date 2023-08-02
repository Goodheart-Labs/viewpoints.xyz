import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// POST /api/comments/:id/flag
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

  const comment = await prisma.comments.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!comment) {
    notFound();
  }

  const body = await request.json();

  const response = await prisma.flagged_comments.create({
    data: {
      comment_id: comment.id,
      user_id: userId,
      session_id:
        request.cookies.get(SESSION_ID_COOKIE_NAME)?.value ??
        body.session_id ??
        null,
      reason: body.reason,
    },
  });

  return NextResponse.json(response);
}
