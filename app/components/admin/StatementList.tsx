"use client";

import type { FC } from "react";
import { useState } from "react";

import { FlagIcon } from "@heroicons/react/20/solid";
import { CornerUpLeftIcon, TrashIcon } from "lucide-react";

import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";
import { Separator } from "@/app/components/shadcn/ui/separator";

import type { FlaggedStatement, Poll, Statement } from "@/db/schema";

import DeleteFlaggedStatementDialog from "./DeleteFlaggedStatementDialog";
import DeleteStatementDialog from "./DeleteStatementDialog";
import { StatementListButton } from "./StatementListButton";
import { TooltipProvider } from "../shadcn/ui/tooltip";

type Props = {
  poll: Poll;
  statements: Statement[];
  flaggedStatements: Record<Statement["id"], FlaggedStatement[]>;
};

const StatementsList: FC<Props> = ({ poll, statements, flaggedStatements }) => {
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

  return (
    <TooltipProvider>
      <ScrollArea className="flex flex-col w-full px-6">
        {statements.map((statement, index) => (
          <div key={statement.id} className="mt-1 mb-2 ">
            <div className="mb-2">
              {(flaggedStatements[statement.id] ?? []).length > 1 && (
                <span className="flex items-center text-xs bg-accent p-1.5 rounded-sm dark:text-zinc-400">
                  <FlagIcon width={10} height={10} className="mr-2" />
                  This statement has been removed from poll because of 2
                  reports.
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="mr-2 text-black dark:text-gray-200">
                {statement.text}
              </p>

              <div className="flex gap-2">
                {(flaggedStatements[statement.id] ?? []).length > 1 && (
                  <StatementListButton
                    onClick={() =>
                      openDeleteFlaggedStatementsDialog(statement.id)
                    }
                    tooltip="Remove reports and restore statement"
                  >
                    <CornerUpLeftIcon
                      width={12}
                      height={12}
                      className="w-4 h-4 text-foreground"
                    />
                  </StatementListButton>
                )}

                <StatementListButton
                  onClick={() => openDeleteStatementDialog(statement.id)}
                  tooltip="Delete statement"
                >
                  <TrashIcon
                    width={12}
                    height={12}
                    className="w-4 h-4 text-foreground"
                  />
                </StatementListButton>
              </div>
            </div>
            {index !== statements.length - 1 && (
              <Separator className="my-2 bg-muted" />
            )}
          </div>
        ))}
        {selectedStatementId && modalType === "statement" && (
          <DeleteStatementDialog
            pollId={poll.id}
            statementId={selectedStatementId}
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
          />
        )}
        {selectedStatementId && modalType === "flaggedStatement" && (
          <DeleteFlaggedStatementDialog
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
            pollId={poll.id}
            statementId={selectedStatementId}
          />
        )}
      </ScrollArea>
    </TooltipProvider>
  );
};

export default StatementsList;
