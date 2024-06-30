import { db } from "@/db/client";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { slug: string };
  },
) {
  // @ts-expect-error Clerk RequestLike more comprehensive than Request
  const { userId } = getAuth(request);
  const { slug } = params;

  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (!poll) return new Response(JSON.stringify({ isAdmin: false }));

  return new Response(JSON.stringify({ isAdmin: poll.user_id === userId }));
}
