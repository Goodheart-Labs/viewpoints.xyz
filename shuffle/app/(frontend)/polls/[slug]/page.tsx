import prisma from "@/lib/prisma";
import Poll from "./client";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { polls_visibility_enum } from "@prisma/client";

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

  if (
    !poll ||
    (poll.visibility === polls_visibility_enum.private &&
      poll.user_id !== userId)
  ) {
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
