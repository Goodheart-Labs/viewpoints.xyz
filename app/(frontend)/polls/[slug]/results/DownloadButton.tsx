"use client";

import { Button } from "@/app/components/shadcn/ui/button";
import type { getPollResults } from "@/lib/pollResults/getPollResults";
import { Download } from "lucide-react";
import { stringify } from "csv-stringify/sync";

type PollResults = Awaited<ReturnType<typeof getPollResults>>;

export const DownloadButton = (results: PollResults) => {
  getResponseRows(results);
  return (
    <Button
      variant="outline"
      onClick={() => {
        const responseRows = getResponseRows(results);

        const output = stringify(responseRows, {
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
};

type ResponseCSVRow = {
  // Statement Information
  statement_id: number;
  statement_text: string;

  // Response Information
  response_id: number;
  created_at: string;

  // Option Information
  option_id: string;
  option_text: string;

  // User Info
  session_id: string;
  user_id: string;
};

/**
 * Create the rows of all responses to all questions
 */
function getResponseRows(results: PollResults) {
  const rows: ResponseCSVRow[] = [];

  for (const statement of results.statements) {
    // Statement Info
    const statement_id = statement.id;
    const statement_text = statement.text;

    for (const response of statement.responses) {
      // Response Info
      const { choice, created_at, session_id, user_id, id, option_id } =
        response;

      let option_text = choice?.toString() ?? "";

      // Get response text for demo question
      if (statement.question_type === "demographic" && option_id !== null) {
        option_text = getOptionText(option_id, results.statementOptions);
      }

      const row: ResponseCSVRow = {
        statement_id,
        statement_text,
        response_id: id,
        option_id: option_id?.toString() ?? "",
        option_text,
        created_at: created_at.toISOString(),
        session_id,
        user_id: user_id?.toString() ?? "",
      };

      rows.push(row);
    }
  }

  return rows;
}

/**
 * Given an option and the statement options,
 * return the text of the option
 */
function getOptionText(
  optionId: number,
  statementOptions: PollResults["statementOptions"],
) {
  for (const options of Object.values(statementOptions)) {
    for (const option of options) {
      if (option.id === optionId) {
        return option.option;
      }
    }
  }

  return "";
}
