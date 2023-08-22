"use client";

import { useMemo, useState } from "react";
import { useQuery } from "react-query";

import axios from "axios";
import Head from "next/head";

import Graphs, { GraphType } from "@/components/Graphs";
import type { Poll, Response, Statement } from "@/lib/api";

// Default export
// -----------------------------------------------------------------------------

const GraphsClient = ({
  poll,
  statements: initialStatements,
  responses: initialResponses,
  url,
}: {
  poll: Poll;
  statements: Statement[];
  responses: Response[];
  url: string;
}) => {
  // State

  const [graphType, setGraphType] = useState<GraphType>(
    GraphType.BackgroundBar,
  );

  // Sharing

  const twitterShareUrl = useMemo(
    () =>
      `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`,
    [poll.id, url],
  );

  // Mutations

  const { data: statements } = useQuery(
    ["statements", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/statements`);
      return data as Statement[];
    },
    {
      initialData: initialStatements,
    },
  );

  const { data: responses } = useQuery(
    ["responses", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/responses/all`);
      return data as Response[];
    },
    {
      initialData: initialResponses,
    },
  );

  const statementIds = useMemo(
    () => (statements ?? []).map((statement) => statement.id),
    [statements],
  );

  // Render

  return (
    <main className="flex flex-col items-center w-full min-h-screen px-4 gradient sm:px-0">
      <Head>
        <title>{poll.title}</title>
        <meta name="description" content={poll.core_question} />
        <meta property="og:title" content={poll.title} />
        <meta property="og:description" content={poll.core_question} />
        <meta property="og:url" content={twitterShareUrl} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={poll.title} />
        <meta property="twitter:description" content={poll.core_question} />
        <meta property="twitter:site" content="viewpoints.xyz" />
      </Head>

      <div className="flex flex-col mt-10 sm:mt-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">Graphs</h2>
      </div>

      <div>
        <select
          onChange={(e) => setGraphType(e.target.value as GraphType)}
          value={graphType}
        >
          {Object.values(GraphType).map((gt) => (
            <option key={gt} value={gt}>
              {gt}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-12">
        <Graphs
          responses={responses ?? []}
          statementIds={statementIds}
          graphType={graphType}
        />
      </div>
    </main>
  );
};

export default GraphsClient;
