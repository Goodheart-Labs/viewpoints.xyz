import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// POST /api/statements/:id/responses
// -----------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  {
    params: { id },
  }: {
    params: { id: string };
  },
) {
  const statement = await prisma.statement.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!statement) {
    notFound();
  }

  const body = await request.json();

  const response = await prisma.responses.create({
    data: {
      statementId: parseInt(id),
      session_id: body.session_id,
      user_id: body.user_id ?? null,
      choice: body.choice,
    },
  });

  return NextResponse.json(response);
}
