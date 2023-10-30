import { db } from "@/db/client";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export const refreshPoll = async (pollId: number) => {
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("id", "=", pollId)
    .executeTakeFirst();

  if (!poll) {
    notFound();
  }

  revalidatePath(`/polls/${poll.slug}`);
  revalidatePath(`/polls/${poll.slug}/admin`);
  revalidatePath(`/polls/${poll.slug}/results`);
};
