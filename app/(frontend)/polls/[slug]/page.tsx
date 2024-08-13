import type { SORT_PARAM, SortKey } from "@/lib/pollResults/constants";
import { PollPage } from "@/app/components/polls/PollPage";
import { Statistics } from "@/app/components/polls/responses/Statistics";
import { CreateStatementButton } from "@/app/components/polls/statements/CreateStatementButton";
import { currentUser } from "@clerk/nextjs/server";
import { getPollResults } from "@/lib/pollResults/getPollResults";
import { getVisitorId } from "@/lib/getVisitorId";
import { getData } from "./getData";

type PollPageProps = {
  params: { slug: string };
  searchParams: { [SORT_PARAM]?: SortKey };
};

export const dynamic = "force-dynamic";

export default async function Poll({ params, searchParams }: PollPageProps) {
  const visitorId = await getVisitorId();
  const initialData = await getData(params.slug, visitorId);
  const initialPollResults = await getPollResults(
    params.slug,
    searchParams.sort,
  );
  const user = await currentUser();

  return (
    <PollPage
      initialData={initialData}
      initialPollResults={initialPollResults}
      userId={user?.id}
    >
      <Statistics
        initialPollData={initialData}
        initialPollResults={initialPollResults}
        sortBy={searchParams.sort}
      >
        <div className="flex items-center justify-between">
          <p className="text-zinc-100">End of statements</p>
          <CreateStatementButton pollId={initialData.poll.id} />
        </div>
      </Statistics>
    </PollPage>
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
