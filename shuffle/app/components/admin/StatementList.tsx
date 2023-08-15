"use client";

import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { useMutation, useQuery } from "react-query";

import type { Statement } from "@prisma/client";
import axios from "axios";

import type { Poll } from "@/lib/api";

const StatementsList = ({
  poll,
}: PropsWithChildren<{
  poll: Poll;
}>) => {
  // Data

  const { data: statements, refetch: refetchStatements } = useQuery<
    Statement[]
  >(["statements", poll.id], async () => {
    const { data } = await axios.get(`/api/polls/${poll.id}/statements`);
    return data as Statement[];
  });

  // Callbacks

  const deleteStatementMutation = useMutation(
    async (statementId: string) => {
      await axios.delete(`/api/statements/${statementId}`);
    },
    {
      onSuccess: () => {
        refetchStatements();
      },
    },
  );

  const onClickDeleteStatement = useCallback(
    (statement: number) =>
      async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        // eslint-disable-next-line no-restricted-globals, no-alert
        if (confirm("Are you sure you want to delete this statement?")) {
          await deleteStatementMutation.mutateAsync(String(statement));
        }
      },
    [deleteStatementMutation],
  );

  // Render

  return (
    <div className="flex flex-col w-full mt-4">
      {(statements ?? []).map((statement) => (
        <div
          key={statement.id}
          className="flex justify-between px-3 py-2 mt-1 mb-2 border border-gray-500 rounded"
        >
          <p className="text-black dark:text-gray-200">{statement.text}</p>
          <span>
            <a href="#" onClick={onClickDeleteStatement(statement.id)}>
              X
            </a>
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatementsList;
