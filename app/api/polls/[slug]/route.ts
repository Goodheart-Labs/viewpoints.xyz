import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { NextResponse } from "next/server";
import { getVisitorId } from "@/lib/getVisitorId";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  const visitorId = await getVisitorId();
  const res = await getData(slug, visitorId);

  return NextResponse.json(res);
}
