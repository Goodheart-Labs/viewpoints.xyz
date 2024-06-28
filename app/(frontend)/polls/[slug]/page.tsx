import {
  BarChartIcon,
  LockClosedIcon,
  LockOpen2Icon,
} from "@radix-ui/react-icons";
import { Statistics } from "@/app/components/polls/responses/Statistics";
import UserResponses from "@/app/components/polls/responses/UserResponses";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import { Tutorial } from "@/app/components/polls/Tutorial";
import type { SORT_PARAM, SortKey } from "@/lib/pollResults/constants";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";
import { QrCodeGenerator } from "@/app/components/polls/QrCodeGenerator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPollAdminOrSuperadmin } from "@/utils/auth";
import { auth } from "@clerk/nextjs";
import { BackToSouthGlos } from "@/components/BackToSouthGlos";
import { headers } from "next/headers";
import { getData } from "./getData";

type PollPageProps = {
  params: { slug: string };
  searchParams: { [SORT_PARAM]?: SortKey };
};

const PollPage = async ({ params, searchParams }: PollPageProps) => {
  const headersList = headers();
  const pathname = headersList.get("x-pathname");

  const {
    poll,
    statements,
    filteredStatements,
    userResponses,
    statementOptions,
  } = await getData(params.slug);

  const { userId } = auth();

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

  const isCouncilPoll = pathname ? pathname.includes("council") : false;

  const questionsRemaining = filteredStatements.length > 0;

  return (
    <main className="bg-black xl:p-8 xl:gap-8 xl:overflow-y-hidden flex-grow grid xl:content-center">
      {isCouncilPoll && !questionsRemaining ? <BackToSouthGlos /> : null}
      <div className="flex flex-col items-stretch w-full h-full max-w-full mx-auto xl:w-1/2 xl:bg-zinc-900 xl:rounded-xl">
        <div className="p-6 bg-zinc-800 xl:rounded-t-xl">
          <div className="flex items-center justify-between">
            <p className="pl-2 mb-2 text-xs font-bold text-left uppercase border-l-2 text-zinc-400 border-l-zinc-400">
              Topic
            </p>

            <div className="flex ml-auto">
              <div className="mr-2">
                <QrCodeGenerator />
              </div>

              <Link href={`/polls/${poll.slug}/results`} className="mr-2 group">
                <div className="rounded-full bg-zinc-600 text-white text-xs px-2 py-[6px] group-hover:bg-zinc-500">
                  <BarChartIcon className="inline w-3 h-3 mr-2" />
                  Results
                </div>
              </Link>

              <div className="rounded-full bg-zinc-600 text-white text-xs px-2 py-[6px]">
                <VisibilityIcon className="inline w-3 h-3 mr-2" />

                {visibilityText}
              </div>
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

            <div className="flex justify-center mt-8 mb-10 sm:mb-0 sm:mt-0">
              <CreateStatementButton pollId={poll.id} />
            </div>

            <ScrollArea className="mt-4">
              <UserResponses responses={userResponses} />
            </ScrollArea>
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
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { poll } = await getData(slug);

  return {
    title: `viewpoints.xyz | ${poll?.title}`,
    description: poll?.core_question,
  };
}

export default PollPage;
