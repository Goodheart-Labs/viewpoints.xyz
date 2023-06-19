"use client";

import Graphs, { GraphType } from "@/components/Graphs";
import { Comment, Poll, Response } from "@/lib/api";
import axios from "axios";
import Head from "next/head";
import { useState, useMemo } from "react";
import { useQuery } from "react-query";

// Default export
// -----------------------------------------------------------------------------

const GraphsClient = ({
  poll,
  comments: initialComments,
  responses: initialResponses,
  url,
}: {
  poll: Poll;
  comments: Comment[];
  responses: Response[];
  url: string;
}) => {
  // State

  const [graphType, setGraphType] = useState<GraphType>(
    GraphType.BackgroundBar
  );

  // Sharing

  const twitterShareUrl = useMemo(
    () =>
      `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`,
    [poll.id, url]
  );

  // Mutations

  const { data: comments } = useQuery(
    ["comments", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/comments`);
      return data as Comment[];
    },
    {
      initialData: initialComments,
    }
  );

  const { data: responses } = useQuery(
    ["responses", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/responses/all`);
      return data as Response[];
    },
    {
      initialData: initialResponses,
    }
  );

  const commentIds = useMemo(
    () => (comments ?? []).map((comment) => comment.id),
    [comments]
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
          {Object.values(GraphType).map((graphType) => (
            <option key={graphType} value={graphType}>
              {graphType}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-12">
        <Graphs
          responses={responses ?? []}
          commentIds={commentIds}
          graphType={graphType}
        />
      </div>
    </main>
  );
};

export default GraphsClient;
