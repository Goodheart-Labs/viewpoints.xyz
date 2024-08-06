import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { getPollResults } from "@/lib/pollResults/getPollResults";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  const res = await getPollResults(slug);

  return NextResponse.json(res);
}
