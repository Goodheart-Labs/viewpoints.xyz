import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { EmbedCardsView } from "./view";

// Types
// -----------------------------------------------------------------------------

type EmbeddedPollProps = {
  params: { slug: string };
};

// Default export
// -----------------------------------------------------------------------------

const EmbeddedPoll = async ({ params: { slug } }: EmbeddedPollProps) => {
  const { statements, filteredStatements, statementOptions } =
    await getData(slug);

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

  return (
    <EmbedCardsView
      slug={slug}
      statementsWithoutResponsesAndFlags={statementsWithoutResponsesAndFlags}
      statementsToHideIds={statementsToHideIds}
      statementOptions={statementOptions}
    />
  );
};

export default EmbeddedPoll;
