import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import PollAdminForm from "@/app/components/admin/PollAdminForm";
import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";

type PollAdminPageProps = {
  params: {
    slug: string;
  };
};

async function getData(slug: string) {
  const poll = await prisma.polls.findUnique({
    where: {
      slug,
    },
    include: {
      statements: {
        select: {
          _count: {
            select: {
              flaggedStatements: true,
            },
          },
          id: true,
          text: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!poll) {
    notFound();
  }

  const { userId } = auth();
  requirePollAdmin(poll, userId);

  return poll;
}

const PollAdminPage = async ({ params }: PollAdminPageProps) => {
  const poll = await getData(params.slug);

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-black xl:p-8 xl:flex-row xl:justify-center xl:gap-8 xl:overflow-y-hidden">
      <PollAdminForm poll={poll} />
    </main>
  );
};

export default PollAdminPage;
