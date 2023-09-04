"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "react-query";

import { FlagIcon } from "@heroicons/react/20/solid";
import type { FlaggedStatement, Statement } from "@prisma/client";
import axios from "axios";
import { CornerUpLeftIcon, TrashIcon } from "lucide-react";

import type { Poll } from "@/lib/api";

import { Separator } from "../shadcn/ui/separator";

import DeleteFlaggedStatementDialog from "./DeleteFlaggedStatementDialog";
import DeleteStatementDialog from "./DeleteStatementDialog";

const StatementsList = ({
  poll,
}: PropsWithChildren<{
  poll: Poll;
}>) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedStatementId, setSelectedStatementId] = useState<number | null>(
    null,
  );
  const [modalType, setModalType] = useState<
    "statement" | "flaggedStatement" | null
  >(null);

  const openDeleteStatementDialog = (selectedStatement: number) => {
    setModalType("statement");
    setSelectedStatementId(selectedStatement);
    setIsOpen(true);
  };
  const openDeleteFlaggedStatementsDialog = (selectedStatement: number) => {
    setModalType("flaggedStatement");
    setSelectedStatementId(selectedStatement);
    setIsOpen(true);
  };

  const { data: statements, refetch: refetchStatements } = useQuery<
    Statement[]
  >(["statements", poll.id], async () => {
    const { data } = await axios.get(`/api/polls/${poll.id}/statements`);
    return data as Statement[];
  });

  const { data: flaggedStatements, refetch: refetchFlaggedStatements } =
    useQuery<FlaggedStatement[]>(["flaggedStatements", poll.id], async () => {
      const { data } = await axios.get(
        `/api/polls/${poll.id}/flaggedStatements`,
      );
      return data as FlaggedStatement[];
    });

  const statementsWithFlaggedStatements = statements?.map((statement) => ({
    ...statement,
    flaggedStatements: flaggedStatements?.filter(
      (flaggedStatement) => flaggedStatement.statementId === statement.id,
    ),
  }));

  const deleteStatementMutation = useMutation(
    async (statementId: string) => {
      await axios.delete(`/api/statements/${statementId}`);
    },
    {
      onSuccess: () => {
        refetchStatements();
        refetchFlaggedStatements();
      },
    },
  );

  const onClickDeleteStatement = useCallback(
    (statementId: number) => async () => {
      await deleteStatementMutation.mutateAsync(String(statementId));
      setIsOpen(false);
    },
    [deleteStatementMutation],
  );

  const deleteFlaggedStatementMutation = useMutation(
    async (statementId: string) => {
      await axios.delete(
        `/api/polls/${poll.id}/flaggedStatements/${statementId}`,
      );
    },
    {
      onSuccess: () => {
        refetchStatements();
        refetchFlaggedStatements();
      },
    },
  );

  const onClickDeleteFlaggedStatement = useCallback(
    (statementId: number) => async () => {
      await deleteFlaggedStatementMutation.mutateAsync(String(statementId));
      setIsOpen(false);
    },
    [deleteFlaggedStatementMutation],
  );

  return (
    <div className="flex flex-col w-full pb-16">
      {(statementsWithFlaggedStatements ?? []).map((statement) => (
        <div key={statement.id} className=" mt-1 mb-2">
          <div className="mb-2">
            {statement.flaggedStatements &&
              statement?.flaggedStatements?.length > 1 && (
                <span className="flex items-center text-xxs bg-accent py-1">
                  <FlagIcon width={10} height={10} className="mr-2" />
                  This statement has been removed from poll because of 2
                  reports.
                </span>
              )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-black dark:text-gray-200 mr-2">
              {statement.text}
            </p>
            <div className="flex">
              {statement.flaggedStatements &&
                statement?.flaggedStatements?.length > 1 && (
                  <span className="bg-accent p-2.5 rounded-full">
                    <a
                      href="#"
                      onClick={() =>
                        openDeleteFlaggedStatementsDialog(statement.id)
                      }
                    >
                      <CornerUpLeftIcon
                        width={12}
                        height={12}
                        className="w-4 h-4 text-foreground"
                      />
                    </a>
                  </span>
                )}

              <span className="bg-accent p-2.5 ml-2 rounded-full">
                <a
                  href="#"
                  onClick={() => openDeleteStatementDialog(statement.id)}
                >
                  <TrashIcon
                    width={12}
                    height={12}
                    className="w-4 h-4 text-foreground"
                  />
                </a>
              </span>
            </div>
          </div>
          <Separator className="bg-muted my-2" />
        </div>
      ))}
      {selectedStatementId && modalType === "statement" && (
        <DeleteStatementDialog
          isOpen={isOpen}
          closeModal={() => setIsOpen(false)}
          statementId={selectedStatementId}
          onClickDeleteStatement={onClickDeleteStatement}
        />
      )}
      {selectedStatementId && modalType === "flaggedStatement" && (
        <DeleteFlaggedStatementDialog
          isOpen={isOpen}
          closeModal={() => setIsOpen(false)}
          statementId={selectedStatementId}
          onClickDeleteFlaggedStatement={onClickDeleteFlaggedStatement}
        />
      )}
    </div>
  );
};

export default StatementsList;
