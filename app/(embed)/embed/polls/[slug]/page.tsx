import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import Cards from "@/app/components/polls/statements/Cards";
import { Button } from "@/app/components/shadcn/ui/button";
import Link from "next/link";

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

  const href = `https://viewpoints.xyz/polls/${slug}`;

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
    <Cards
      statements={statementsWithoutResponsesAndFlags}
      statementsToHideIds={statementsToHideIds}
      statementOptions={statementOptions}
      emptyMessage={
        <div className="flex flex-col items-center justify-center w-full h-full">
          <p className="mt-48">
            <Link href={href}>
              <Button
                variant="pill"
                size="pill"
                className="pr-5 text-sm dark:bg-white dark:text-gray-800 hover:dark:bg-white/80"
              >
                View results
              </Button>
            </Link>
          </p>
        </div>
      }
    />
  );
};

export default EmbeddedPoll;
