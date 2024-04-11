"use client";

import { Button } from "@/app/components/shadcn/ui/button";
import type { getPollResults } from "@/lib/pollResults/getPollResults";
import { Download } from "lucide-react";
import { stringify } from "csv-stringify/sync";
import type { ChoiceEnum } from "kysely-codegen";

type CSVRow = {
  question: string;
  response: string;
  count: number;
  percentage: number;
};

export const DownloadButton = (
  results: Awaited<ReturnType<typeof getPollResults>>,
) => (
  <Button
    variant="outline"
    onClick={() => {
      const resultsRows = getResultsRows(results);
      const demographicsRows = getDemographicsRows(results);

      const output = stringify([...resultsRows, ...demographicsRows], {
        header: true,
      });
      const blob = new Blob([output], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `poll-${results.poll.slug}-results.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }}
  >
    <Download className="w-4 h-4 mr-2" />
    Download as CSV
  </Button>
);

function getResultsRows(results: Awaited<ReturnType<typeof getPollResults>>) {
  const rows: CSVRow[] = [];

  // get all regular questions
  const questions = results.statements.filter(
    (statement) => statement.question_type === "default",
  );

  for (const question of questions) {
    // loop over the keys of voteCounts
    for (const [choice, count] of question.stats.voteCounts) {
      if (!choice) continue;

      const percentage =
        question.stats.votePercentages.get(choice as ChoiceEnum) ?? 0;

      rows.push({
        question: question.text,
        response: choice,
        count,
        percentage,
      });
    }
  }

  return rows;
}

/**
 * Creating a demographics csv, each row should have a question, it's response,
 * the number of responses, and the percentage of responses.
 * We should include answers that have no responses.
 */
export function getDemographicsRows(
  results: Awaited<ReturnType<typeof getPollResults>>,
) {
  const demographicQuestions = results.statements.filter(
    (statement) => statement.question_type === "demographic",
  );

  const demographicRows: CSVRow[] = [];

  for (const question of demographicQuestions) {
    // Determine the number of responses for each statement
    const responseCount: Record<number, number> = {};
    let totalResponses = 0;
    for (const response of question.responses) {
      const optionId = response.option_id;
      if (optionId === null) {
        continue;
      }

      if (!responseCount[optionId]) {
        responseCount[optionId] = 0;
      }

      responseCount[optionId]++;
      totalResponses++;
    }

    // in here we need to get the responses for each question
    const availableResponses = results.statementOptions[question.id];
    for (const availableResponse of availableResponses) {
      const currentCount = responseCount[availableResponse.id] ?? 0;

      demographicRows.push({
        question: question.text,
        response: availableResponse.option,
        count: currentCount,
        percentage: (100 * currentCount) / totalResponses,
      });
    }
  }

  return demographicRows;
}
