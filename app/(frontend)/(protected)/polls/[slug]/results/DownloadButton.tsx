"use client";

import type { Statement } from "@/db/schema";

import { Button } from "@/app/components/shadcn/ui/button";
import type { getPollResults } from "@/lib/pollResults/getPollResults";
import { Download } from "lucide-react";
import { stringify } from "csv-stringify";

export const DownloadButton = (
  results: Awaited<ReturnType<typeof getPollResults>>,
) => (
  <Button
    variant="outline"
    onClick={() => {
      const rows = buildCsvResults(results);
      stringify(rows, { header: true }, (err, output) => {
        if (err) {
          throw err;
        }
        const blob = new Blob([output], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `poll-${results.poll.id}-results.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }}
  >
    <Download className="w-4 h-4 mr-2" />
    Download as CSV
  </Button>
);

type CsvRow = {
  "Poll ID": number;
  "Statement ID": string;
  Text: string;
  "Question Type": Statement["question_type"];
  "Answer Type": Statement["answer_type"];
  "Response ID": number;
  "Session ID": string;
  "User ID": string;
  Choice: string;
  "Created At": string;
};

function buildCsvResults(results: Awaited<ReturnType<typeof getPollResults>>) {
  const rows: CsvRow[] = [];

  for (const [statementId, statement] of Object.entries(results.statements)) {
    for (const response of statement.responses) {
      rows.push({
        "Poll ID": results.poll.id,
        "Statement ID": statementId,
        Text: statement.text,
        "Question Type": statement.question_type,
        "Answer Type": statement.answer_type,
        "Response ID": response.id,
        "Session ID": response.session_id,
        "User ID": response.user_id ?? "",
        Choice: response.choice ?? "",
        "Created At": response.created_at.toISOString(),
      });
    }
  }

  return rows;
}
