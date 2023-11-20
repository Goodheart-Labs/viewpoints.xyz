import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";

import { Statistics } from "@/app/components/polls/responses/Statistics";
import UserResponses from "@/app/components/polls/responses/UserResponses";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import { Tutorial } from "@/app/components/polls/Tutorial";
import type { SORT_PARAM, SortKey } from "@/lib/pollResults/constants";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";

import { getData } from "./getData";

type PollPageProps = {
  params: { slug: string };
  searchParams: { [SORT_PARAM]?: SortKey };
};

const PollPage = async ({ params, searchParams }: PollPageProps) => {
  const { poll, filteredStatements, userResponses, statementOptions } =
    await getData(params.slug);

  const visibilityText =
    poll.visibility === "public" ? "Public poll" : "Private poll";

  const VisibilityIcon =
    poll.visibility === "public" ? LockOpen2Icon : LockClosedIcon;

  return (
    <main className="flex flex-col items-center flex-1 w-full bg-black xl:p-8 xl:flex-row xl:justify-center xl:gap-8 xl:overflow-y-hidden">
      <div className="flex flex-col items-stretch w-full h-full max-w-full xl:w-1/2 xl:bg-zinc-900 xl:rounded-xl">
        <div className="p-6 bg-zinc-800 xl:rounded-t-xl">
          <div className="flex items-center justify-between">
            <p className="pl-2 mb-2 text-xs font-bold text-left uppercase border-l-2 text-zinc-400 border-l-zinc-400">
              Topic
            </p>

            <div className="rounded-full bg-zinc-600 text-white text-xs px-2 py-[6px]">
              <VisibilityIcon className="inline w-3 h-3 mr-2" />

              {visibilityText}
            </div>
          </div>
          <h1 className="font-semibold text-white">{poll.title}</h1>
          <h2 className="text-sm text-zinc-500">
            What do you think of the following statements?
          </h2>
        </div>

        {filteredStatements.length > 0 ? (
          <>
            <Cards
              statements={filteredStatements}
              statementOptions={statementOptions}
            />

            <div className="flex justify-center mt-4 mb-10 sm:mb-0 sm:mt-0">
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

export default PollPage;
