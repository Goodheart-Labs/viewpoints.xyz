import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

import Poll from "./client";

// Types
// -----------------------------------------------------------------------------

type PollPageProps = {
  params: { slug: string };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: PollPageProps) {
  const { userId } = auth();

  const poll = await prisma.polls.findFirst({
    where: {
      slug: params.slug,
    },
  });

  if (!requirePollAdminIfPollIsPrivate(poll, userId)) {
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
