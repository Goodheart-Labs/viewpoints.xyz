import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";

import { CommentsSheet } from "@/app/components/polls/comments/CommentsSheet";
import { Statistics } from "@/app/components/polls/responses/Statistics";
import UserResponses from "@/app/components/polls/responses/UserResponses";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import type { SortKey } from "@/lib/pollResults/constants";
import { ScrollArea } from "@/shadcn/scroll-area";

import { getData } from "./getData";

type PollPageProps = {
  params: { slug: string };
  searchParams: { sort?: SortKey };
};

const PollPage = async ({ params, searchParams }: PollPageProps) => {
  const { poll, filteredStatements, userResponses } = await getData(
    params.slug,
  );

  const visibilityText =
    poll.visibility === "public" ? "Public poll" : "Private poll";

  const VisibilityIcon =
    poll.visibility === "public" ? LockOpen2Icon : LockClosedIcon;

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-black xl:p-8 xl:flex-row xl:justify-center xl:gap-8 xl:overflow-y-hidden">
      <div className="hidden xl:block w-1/4" />

      <div className="flex flex-col items-stretch max-w-full xl:w-1/2 h-full xl:bg-zinc-900 xl:rounded-xl">
        <div className="bg-zinc-800 p-6 xl:rounded-t-xl">
          <div className="flex justify-between items-center">
            <p className="text-left text-zinc-400 uppercase font-bold text-xs border-l-2 border-l-zinc-400 pl-2 mb-2">
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
            <Cards statements={filteredStatements} />

            <div className="flex justify-center">
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
            <div className="flex justify-between items-center">
              <p>End of statements</p>
              <CreateStatementButton pollId={poll.id} />
            </div>
          </Statistics>
        )}
      </div>

      <CommentsSheet comments={poll.comments} />
    </main>
  );
};

export default PollPage;
