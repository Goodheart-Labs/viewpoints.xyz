import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import autogenerateStatements from "@/lib/autogenerateStatements";

// POST /api/completions
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    notFound();
  }

  const { title, question } = await request.json();

  const autogeneratedStatements = await autogenerateStatements({
    title,
    question,
  });

  return NextResponse.json(autogeneratedStatements);
}
