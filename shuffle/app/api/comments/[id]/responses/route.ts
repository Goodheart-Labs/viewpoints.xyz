import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// POST /api/comments/:id/responses
// -----------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  }
) {
  const comment = await prisma.comments.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!comment) {
    notFound();
  }

  const body = await request.json();

  const response = await prisma.responses.create({
    data: {
      comment_id: parseInt(id),
      session_id: body.session_id,
      user_id: body.user_id ?? null,
      valence: body.valence,
    },
  });

  return NextResponse.json(response);
}
