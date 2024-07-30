"use client";

import {
  BarChartIcon,
  LockClosedIcon,
  LockOpen2Icon,
} from "@radix-ui/react-icons";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import { Tutorial } from "@/app/components/polls/Tutorial";
import { QrCodeGenerator } from "@/app/components/polls/QrCodeGenerator";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { BackToSouthGlos } from "@/components/BackToSouthGlos";
import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { useQuery } from "react-query";
import { ReactNode } from "react";
import { isPollAdminOrSuperadmin, useIsSuperuser } from "@/utils/authFrontend";
import { Progress } from "@/app/components/shadcn/ui/progress";

type PollPageProps = {
  initialData: Awaited<ReturnType<typeof getData>>;
  children: ReactNode;
  userId: string;
};

export function PollPage({ initialData, children, userId }: PollPageProps) {
  const { data } = usePolledPollData(initialData);
  const { poll, statements, filteredStatements, statementOptions } = data || {};

  const isSuperAdmin = useIsSuperuser();
  const canSeePoll =
    poll.visibility !== "private" ||
    isPollAdminOrSuperadmin(poll, userId, isSuperAdmin);

  if (!canSeePoll) {
    notFound();
  }

  const visibilityText =
    poll.visibility === "public" ? "Public poll" : "Private poll";

  const VisibilityIcon =
    poll.visibility === "public" ? LockOpen2Icon : LockClosedIcon;

  const statementsWithoutResponsesAndFlags = statements.map((statement) => ({
    ...statement,
    responses: [],
    flaggedStatements: [],
  }));

  const filteredStatementIds = filteredStatements.map(
    (statement) => statement.id,
  );

  const statementsToHideIds =
    filteredStatementIds.length > 0
      ? statements
          .filter((statement) => !filteredStatementIds.includes(statement.id))
          .map((statement) => statement.id)
      : [];

  const isCouncilPoll = poll.slug?.includes("council");

  const questionsRemaining = filteredStatements.length > 0;

  return (
    <main className="bg-black xl:p-8 xl:gap-8 xl:overflow-y-hidden flex-grow grid xl:content-center">
      {isCouncilPoll && !questionsRemaining ? <BackToSouthGlos /> : null}
      <div className="flex flex-col relative items-stretch w-full h-full max-w-full mx-auto xl:w-1/2 xl:bg-zinc-900 xl:rounded-xl">
        <div className="p-6 bg-zinc-800 xl:rounded-t-xl">
          <div className="flex items-end justify-between ">
            <p className="pl-2 mb-2 text-xs font-bold text-left uppercase border-l-2 text-zinc-400 border-l-zinc-400">
              Topic
            </p>

            <div className="flex items-center gap-3 ml-auto mb-2">
              <div className="text-white rounded-l text-xs">
                <VisibilityIcon className="inline w-3 h-3 mr-1.5 mb-0.5" />

                {visibilityText}
              </div>

              <div className="">
                <QrCodeGenerator />
              </div>

              <Link href={`/polls/${poll.slug}/results`} className="group">
                <div className="flex items-center rounded-full bg-zinc-600 text-white text-xs px-3 py-[6px] group-hover:bg-zinc-500">
                  <BarChartIcon className="inline w-3 h-3 mr-1.5" />
                  Results
                </div>
              </Link>
            </div>
          </div>
          <h1 className="font-semibold text-white">{poll.title}</h1>
          <h2 className="text-sm text-zinc-500">
            {poll.core_question ||
              "What do you think of the following statements?"}
          </h2>
        </div>

        {questionsRemaining ? (
          <>
            <div className="px-6 pt-6">
              <Progress
                className="w-full h-2"
                value={(statementsToHideIds.length / statements.length) * 100}
              />
            </div>
            <Cards
              statements={statementsWithoutResponsesAndFlags}
              statementsToHideIds={statementsToHideIds}
              statementOptions={statementOptions}
            />

            <div className="flex justify-center mt-8 mb-10 sm:mb-0 sm:mt-0 pb-8">
              <CreateStatementButton pollId={poll.id} />
            </div>
          </>
        ) : (
          children
        )}
      </div>
      <Tutorial />
    </main>
  );
}

export const POLLED_POLL_QUERY_KEY = "/polls/[slug]";
export function usePolledPollData(
  initialData: Awaited<ReturnType<typeof getData>>,
) {
  const params = useParams();
  const slug = params.slug;
  const { data } = useQuery({
    queryKey: [POLLED_POLL_QUERY_KEY, slug],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${slug}`);
      return res.json() as ReturnType<typeof getData>;
    },
    initialData,
    refetchInterval: 15_000,
  });

  return { data };
}
