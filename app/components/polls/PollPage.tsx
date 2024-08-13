"use client";

import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import { Tutorial } from "@/app/components/polls/Tutorial";
import { QrCodeGenerator } from "@/app/components/polls/QrCodeGenerator";
import { notFound } from "next/navigation";
import { BackToSouthGlos } from "@/components/BackToSouthGlos";
import type { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { useEffect, type ReactNode } from "react";
import { isPollAdminOrSuperadmin, useIsSuperuser } from "@/utils/authFrontend";

import { DownloadIcon, LinkIcon } from "lucide-react";
import { getResponseRows } from "@/app/(frontend)/polls/[slug]/results/DownloadButton";
import { stringify } from "csv-stringify/sync";
import type { getPollResults } from "@/lib/pollResults/getPollResults";
import { toast } from "@/app/components/shadcn/ui/use-toast";
import { usePolledPollData } from "@/lib/usePolledPollData";
import { usePolledResultsData } from "@/lib/usePolledResultsData";

type PollPageProps = {
  initialData: Awaited<ReturnType<typeof getData>>;
  initialPollResults: Awaited<ReturnType<typeof getPollResults>>;
  children: ReactNode;
  userId?: string;
};

export function PollPage({
  initialData,
  initialPollResults,
  children,
  userId,
}: PollPageProps) {
  const results = usePolledResultsData(initialPollResults);

  const { poll, statements, filteredStatements, statementOptions } =
    usePolledPollData(initialData);

  const isSuperAdmin = useIsSuperuser();
  const canSeePoll =
    poll.visibility !== "private" ||
    isPollAdminOrSuperadmin(poll, userId, isSuperAdmin);

  if (!canSeePoll || !poll) {
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
    filteredStatementIds && filteredStatementIds.length > 0
      ? statements
          .filter((statement) => !filteredStatementIds.includes(statement.id))
          .map((statement) => statement.id)
      : [];

  const isCouncilPoll = poll.slug?.includes("council");

  const questionsRemaining = filteredStatements.length > 0;

  useEffect(() => {
    getResponseRows(results!);
  }, [results]);

  const handleDownloadCSV = () => {
    const responseRows = getResponseRows(results!);

    const output = stringify(responseRows, {
      header: true,
    });
    const blob = new Blob([output], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poll-${results?.poll.slug}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareResultsLink = () => {
    const url = `${window.location.origin}/polls/${results?.poll.slug}/results`;
    navigator.clipboard.writeText(url);
    toast({
      description: "Results link copied to clipboard",
    });
  };

  const buttonClasses =
    "flex items-center rounded-full bg-zinc-600 text-white text-xs px-3 py-[6px] hover:bg-zinc-500";

  return (
    <main className="bg-black xl:p-8 xl:gap-8 xl:overflow-y-hidden flex-grow grid xl:content-start xl:py-24">
      {isCouncilPoll && !questionsRemaining ? <BackToSouthGlos /> : null}
      <div className="flex flex-col relative items-stretch w-full h-full max-w-full mx-auto xl:w-1/2 xl:bg-zinc-900 xl:rounded-xl">
        <div className="p-6 bg-zinc-800 xl:rounded-t-xl">
          <div className="flex items-start justify-between ">
            <p className="pl-2 mt-1 mb-2 text-xs font-bold text-left uppercase border-l-2 text-zinc-400 border-l-zinc-400">
              Topic
            </p>

            <div className="flex justify-end flex-wrap items-center gap-3 ml-auto mb-2">
              <div className="text-white rounded-l text-xs">
                <VisibilityIcon className="inline w-3 h-3 mr-1.5 mb-0.5" />

                {visibilityText}
              </div>

              <div className="">
                <QrCodeGenerator />
              </div>

              <button
                className={buttonClasses}
                onClick={handleDownloadCSV}
                type="button"
              >
                <DownloadIcon className="w-3 h-3 mr-1.5" />
                Download CSV
              </button>

              <button
                className={buttonClasses}
                onClick={handleShareResultsLink}
                type="button"
              >
                <LinkIcon className="inline w-3 h-3 mr-1.5" />
                Share results link
              </button>
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
            {statementsWithoutResponsesAndFlags &&
              statementsToHideIds &&
              statementOptions && (
                <Cards
                  statements={statementsWithoutResponsesAndFlags}
                  statementsToHideIds={statementsToHideIds}
                  statementOptions={statementOptions}
                />
              )}
            {poll && (
              <div className="flex justify-center mt-8 mb-10 sm:mb-0 sm:mt-0 pb-8">
                <CreateStatementButton pollId={poll.id} />
              </div>
            )}
          </>
        ) : (
          children
        )}
      </div>
      <Tutorial />
    </main>
  );
}
