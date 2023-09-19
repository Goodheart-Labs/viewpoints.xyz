import Poll from "./client";
import { getData } from "./getData";

type PollPageProps = {
  params: { slug: string };
};

const PollPage = async ({ params }: PollPageProps) => {
  const { poll, filteredStatements, userResponses } = await getData(
    params.slug,
  );

  return (
    <Poll
      poll={poll}
      userResponses={userResponses}
      statementsToAnswer={filteredStatements}
      comments={poll.comments}
    />
  );
};

export default PollPage;
