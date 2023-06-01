import prisma from "@/lib/prisma";
import Poll from "./client";
import { notFound } from "next/navigation";

// Types
// -----------------------------------------------------------------------------

type PollPageProps = {
  params: { slug: string };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: PollPageProps) {
  const poll = await prisma.polls.findFirst({
    where: {
      slug: params.slug,
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

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.slug}`;

  return <Poll poll={poll} comments={comments} url={url} />;
};

export default PollPage;
