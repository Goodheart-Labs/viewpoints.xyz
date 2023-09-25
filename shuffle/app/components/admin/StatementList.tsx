"use client";

import type { FC } from "react";
import { useState } from "react";

import { FlagIcon } from "@heroicons/react/20/solid";
import { CornerUpLeftIcon, TrashIcon } from "lucide-react";

import { ScrollArea } from "@/shadcn/scroll-area";
import { Separator } from "@/shadcn/separator";

import DeleteFlaggedStatementDialog from "./DeleteFlaggedStatementDialog";
import DeleteStatementDialog from "./DeleteStatementDialog";
import type { PollWithStatements } from "./PollAdminForm";

type Props = {
  poll: PollWithStatements;
};

const StatementsList: FC<Props> = ({ poll }) => {
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
    <ScrollArea className="flex flex-col w-full px-6">
      {poll.statements.map((statement, index) => (
        <div key={statement.id} className=" mt-1 mb-2">
          <div className="mb-2">
            {statement._count.flaggedStatements > 1 && (
              <span className="flex items-center text-xxs bg-accent p-1.5 rounded-sm">
                <FlagIcon width={10} height={10} className="mr-2" />
                This statement has been removed from poll because of 2 reports.
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-black dark:text-gray-200 mr-2">
              {statement.text}
            </p>
            <div className="flex">
              {statement._count.flaggedStatements > 1 && (
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
          {index !== poll.statements.length - 1 && (
            <Separator className="bg-muted my-2" />
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
  );
};

export default StatementsList;
