"use client";

import type { FC } from "react";
import { useTransition, useCallback, useOptimistic, useState } from "react";

import { FlagIcon } from "@heroicons/react/20/solid";
import { CornerUpLeftIcon, TrashIcon, EyeOffIcon, EyeIcon } from "lucide-react";

import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";

import type { FlaggedStatement, Poll, Statement } from "@/db/schema";

import { hideStatement, showStatement } from "@/app/api/statements/visibility";
import { cn } from "@/utils/style-utils";
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

  const hide = useCallback(
    (statementId: number) => hideStatement(statementId, poll.id),
    [poll.id],
  );

  const show = useCallback(
    (statementId: number) => showStatement(statementId, poll.id),
    [poll.id],
  );

  return (
    <TooltipProvider>
      <ScrollArea className="flex flex-col w-full px-6">
        {statements.map((statement) => {
          const isFlagged = (flaggedStatements[statement.id] ?? []).length > 1;
          return (
            <StatementListRow
              key={statement.id}
              statement={statement}
              isFlagged={isFlagged}
              hide={hide}
              show={show}
              openDeleteStatementDialog={openDeleteStatementDialog}
              openDeleteFlaggedStatementsDialog={
                openDeleteFlaggedStatementsDialog
              }
            />
          );
        })}
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

const StatementListRow = ({
  statement,
  isFlagged,
  hide,
  show,
  openDeleteStatementDialog,
  openDeleteFlaggedStatementsDialog,
}: {
  statement: Statement;
  isFlagged: boolean;
  hide: (statementId: number) => Promise<void>;
  show: (statementId: number) => Promise<void>;
  openDeleteStatementDialog: (statementId: number) => void;
  openDeleteFlaggedStatementsDialog: (statementId: number) => void;
}) => {
  const [optimisticVisible, toggleVisibleOptimistic] = useOptimistic(
    statement.visible,
    (_, newState: boolean) => newState,
  );

  const [isPending, startTransition] = useTransition();

  return (
    <div
      key={statement.id}
      className="py-1 border-b last-of-type:border-b-0 border-zinc-800"
    >
      {isFlagged ? (
        <div className="mb-2">
          <span className="flex items-center text-xs bg-accent p-1.5 rounded-sm text-zinc-400">
            <FlagIcon width={10} height={10} className="mr-2" />
            This statement has been removed from poll because of 2 reports.
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p
          className={cn("mr-2 text-black text-gray-200", {
            "opacity-25": !optimisticVisible || isFlagged,
          })}
        >
          {statement.text}
        </p>

        <div className="flex gap-2">
          {isFlagged ? (
            <StatementListButton
              onClick={() => openDeleteFlaggedStatementsDialog(statement.id)}
              tooltip="Remove reports and restore statement"
            >
              <CornerUpLeftIcon
                width={12}
                height={12}
                className="w-4 h-4 text-foreground"
              />
            </StatementListButton>
          ) : null}

          {optimisticVisible ? (
            <StatementListButton
              disabled={isPending}
              isLoading={isPending}
              onClick={() => {
                startTransition(() => {
                  toggleVisibleOptimistic(true);
                  hide(statement.id);
                });
              }}
              tooltip="Hide statement"
            >
              <EyeOffIcon className="w-4 h-4 text-foreground" />
            </StatementListButton>
          ) : (
            <StatementListButton
              disabled={isPending}
              isLoading={isPending}
              onClick={() => {
                startTransition(() => {
                  toggleVisibleOptimistic(false);
                  show(statement.id);
                });
              }}
              tooltip="Show statement"
            >
              <EyeIcon className="w-4 h-4 text-foreground" />
            </StatementListButton>
          )}

          <StatementListButton
            onClick={() => openDeleteStatementDialog(statement.id)}
            tooltip="Delete statement"
          >
            <TrashIcon className="w-4 h-4 text-foreground" />
          </StatementListButton>
        </div>
      </div>
    </div>
  );
};
