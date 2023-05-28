import prisma from "@/lib/prisma";
import Poll from "./client";
import { notFound } from "next/navigation";

// Types
// -----------------------------------------------------------------------------

type PollPageProps = {
  params: { id: string };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: PollPageProps) {
  const poll = await prisma.polls.findFirst({
    where: {
      polis_id: params.id,
    },
  });
  if (!poll) {
    notFound();
  }

  const comments = await prisma.comments.findMany({
    where: {
      poll_id: poll.id,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return { poll, comments };
}

// Default export
// -----------------------------------------------------------------------------

const PollPage = async ({ params }: PollPageProps) => {
  const { poll, comments } = await getData({ params });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.polis_id}`;

  return <Poll poll={poll} comments={comments} url={url} />;
};

export default PollPage;
