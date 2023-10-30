import { db } from "@/db/client";
import type { Poll } from "@/db/schema";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/polls/:id
// -----------------------------------------------------------------------------

export async function GET(
  _: NextRequest,
  {
    params: { id: idOrSlug },
  }: {
    params: { id: string };
  },
) {
  const id = parseInt(idOrSlug);
  let poll: Poll | undefined;

  if (Number.isNaN(id)) {
    poll = await db
      .selectFrom("polls")
      .selectAll()
      .where("slug", "=", idOrSlug)
      .executeTakeFirst();
  } else {
    poll = await db
      .selectFrom("polls")
      .selectAll()
      .where("id", "=", idOrSlug as unknown as number)
      .executeTakeFirst();
  }

  if (!poll) {
    notFound();
  }

  return NextResponse.json(poll);
}
