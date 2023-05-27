import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
