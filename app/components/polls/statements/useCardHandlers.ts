import { startTransition, useCallback, useState } from "react";
import type { PanInfo } from "framer-motion";
import type { Response } from "@/db/schema";
import { createResponse } from "@/app/api/responses/createResponse";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { useQueryClient } from "react-query";
import { POLLED_POLL_QUERY_KEY } from "../poll-components";

export const SWIPE_THRESHOLD = 150;

const choiceEvents = {
  agree: "votes.agree",
  disagree: "votes.disagree",
  skip: "votes.skip",
  itsComplicated: "votes.itsComplicated",
} as const;

type HookArgs = {
  statementId: number;
  pollId: number;
  onStatementHide: () => void;
};

/**
 * Handles card swipe and drag events
 */
export const useCardHandlers = ({
  statementId,
  pollId,
  onStatementHide,
}: HookArgs) => {
  const queryClient = useQueryClient();
  const { track } = useAmplitude();

  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);

  const onResponseChoice = useCallback(
    (choice: NonNullable<Response["choice"]>) => {
      startTransition(async () => {
        await createResponse(statementId, {
          type: "choice",
          choice,
        });
        await queryClient.invalidateQueries({
          queryKey: [POLLED_POLL_QUERY_KEY],
        });
      });

      track({
        type: choiceEvents[choice as keyof typeof choiceEvents],
        pollId,
        cardId: statementId,
      });

      switch (choice) {
        case "agree":
          setLeaveX(1000);
          break;
        case "disagree":
          setLeaveX(-1000);
          break;
        case "skip":
          setLeaveY(-1000);
          break;
      }

      onStatementHide();
    },
    [onStatementHide, pollId, statementId, track],
  );

  const onResponseCustomOption = useCallback(
    (customOptionId: number) => {
      startTransition(async () => {
        await createResponse(statementId, {
          type: "customOption",
          customOptionId,
        });
        await queryClient.invalidateQueries({
          queryKey: [POLLED_POLL_QUERY_KEY],
        });
      });

      track({
        type: "votes.customOption",
        pollId,
        cardId: statementId,
        customOptionId,
      });

      // Exit, stage right
      // TODO: different exit animations for custom options?
      setLeaveX(1000);

      onStatementHide();
    },
    [onStatementHide, pollId, statementId, track],
  );

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      track({
        type: "drag",
      });

      if (info.offset.x > SWIPE_THRESHOLD) {
        onResponseChoice("agree");
        return;
      }
      if (info.offset.x < -SWIPE_THRESHOLD) {
        onResponseChoice("disagree");
        return;
      }
      if (info.offset.y < -SWIPE_THRESHOLD) {
        onResponseChoice("skip");
      }
    },
    [onResponseChoice, track],
  );

  return {
    leaveX,
    leaveY,
    onResponseChoice,
    onResponseCustomOption,
    onDragEnd,
  };
};
