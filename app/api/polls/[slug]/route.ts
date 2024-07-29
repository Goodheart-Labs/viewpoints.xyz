import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  const res = await getData(slug);

  return NextResponse.json(res);
}
