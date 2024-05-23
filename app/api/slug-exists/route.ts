import { db } from "@/db/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = decodeURIComponent(searchParams.get("slug")!);

  if (!slug) return new Response(JSON.stringify({ pollExists: false }));

  const pollsMatchingSlug = await db
    .selectFrom("polls")
    .selectAll()
    .where("slug", "=", slug)
    .execute();
  const pollExists = !!pollsMatchingSlug.length;

  return new Response(
    JSON.stringify({
      pollExists,
    }),
  );
}
