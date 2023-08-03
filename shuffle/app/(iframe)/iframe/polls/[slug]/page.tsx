import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

import PollIframeClient from "./client";

// Types
// -----------------------------------------------------------------------------

type PollIframeProps = {
  params: { slug: string };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: PollIframeProps) {
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

const PollIframe = async ({ params }: PollIframeProps) => {
  const { comments } = await getData({ params });

  return <PollIframeClient filteredComments={comments} />;
};

export default PollIframe;
