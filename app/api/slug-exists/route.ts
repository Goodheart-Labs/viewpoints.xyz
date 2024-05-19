import { db } from "@/db/client";

export async function POST(request: Request) {
  const { slug } = await request.json();

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
