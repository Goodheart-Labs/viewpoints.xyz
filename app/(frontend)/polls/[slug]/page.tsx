import {
  BarChartIcon,
  LockClosedIcon,
  LockOpen2Icon,
} from "@radix-ui/react-icons";
import { Statistics } from "@/app/components/polls/responses/Statistics";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import { Tutorial } from "@/app/components/polls/Tutorial";
import type { SORT_PARAM, SortKey } from "@/lib/pollResults/constants";
import { QrCodeGenerator } from "@/app/components/polls/QrCodeGenerator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPollAdminOrSuperadmin } from "@/utils/auth";
import { BackToSouthGlos } from "@/components/BackToSouthGlos";
import { auth } from "@clerk/nextjs/server";
import { getVisitorId } from "@/lib/getVisitorId";
import { getData } from "./getData";

type PollPageProps = {
  params: { slug: string };
  searchParams: { [SORT_PARAM]?: SortKey };
};

export const dynamic = "force-dynamic";

export default async function Poll({ params, searchParams }: PollPageProps) {
  const { userId } = auth();
  const visitorId = await getVisitorId();

  if (!visitorId) {
    throw new Error("Visitor ID not found");
  }

  const {
    poll,
    statements,
    filteredStatements,
    userResponses,
    statementOptions,
  } = await getData(params.slug, visitorId);

  const canSeePoll =
    poll.visibility !== "private" ||
    (await isPollAdminOrSuperadmin(poll, userId));

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
    <main className="bg-black xl:p-8 xl:gap-8 xl:overflow-y-hidden flex-grow grid xl:content-start xl:py-24">
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
          <Statistics
            slug={poll.slug ?? ""}
            userResponses={userResponses}
            sortBy={searchParams.sort}
          >
            <div className="flex items-center justify-between">
              <p className="text-zinc-100">End of statements</p>
              <CreateStatementButton pollId={poll.id} />
            </div>
          </Statistics>
        )}
      </div>
      <Tutorial />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const visitorId = await getVisitorId();
  const { slug } = params;
  const { poll } = await getData(slug, visitorId);

  return {
    title: `viewpoints.xyz | ${poll?.title}`,
    description: poll?.core_question,
  };
}
