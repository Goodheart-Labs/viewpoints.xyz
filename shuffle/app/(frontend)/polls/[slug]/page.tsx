import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

import Poll from "./client";

type PollPageProps = {
  params: { slug: string };
};

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;
const MAX_NUM_SKIPS_BEFORE_REMOVAL = 5;

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

  const statements = await prisma.statement.findMany({
    where: {
      poll_id: poll.id,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      author: true,
      flaggedStatements: true,
      responses: true,
    },
  });

  const filteredStatements = statements.filter((statement) => {
    if (statement.flaggedStatements.length > MAX_NUM_FLAGS_BEFORE_REMOVAL) {
      return false;
    }

    const numSkips = statement.responses.filter(
      (response) => response.choice === "skip",
    ).length;

    if (numSkips > MAX_NUM_SKIPS_BEFORE_REMOVAL) {
      return false;
    }

    const didUserAnswer = statement.responses.some(
      (response) => response.user_id === userId,
    );

    if (didUserAnswer) {
      return false;
    }

    const didUserFlag = statement.flaggedStatements.some(
      (flag) => flag.user_id === userId,
    );

    return !didUserFlag;
  });

  const comments = await prisma.comment.findMany({
    where: {
      pollId: poll.id,
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { poll, filteredStatements, comments };
}

const PollPage = async ({ params }: PollPageProps) => {
  const { poll, filteredStatements, comments } = await getData({ params });

  return (
    <Poll poll={poll} statements={filteredStatements} comments={comments} />
  );
};

export default PollPage;
