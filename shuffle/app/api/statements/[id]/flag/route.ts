import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { SESSION_ID_COOKIE_NAME } from "@/middleware";

// POST /api/statements/:id/flag
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

  const statement = await prisma.statement.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!statement) {
    notFound();
  }

  const body = await request.json();

  const response = await prisma.flaggedStatement.create({
    data: {
      statementId: statement.id,
      user_id: userId,
      session_id:
        request.cookies.get(SESSION_ID_COOKIE_NAME)?.value ??
        body.session_id ??
        null,
      reason: body.reason,
      description: body.description || null,
    },
  });

  return NextResponse.json(response);
}
