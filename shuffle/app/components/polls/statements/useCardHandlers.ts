import { startTransition, useState } from "react";

import type { PanInfo } from "framer-motion";

import { createResponse } from "@/app/api/responses/createResponse";
import type { Choice } from "@/lib/api";
import { useAmplitude } from "@/providers/AmplitudeProvider";

const SWIPE_THRESHOLD = 150;

const choiceEvents = {
  agree: "votes.agree",
  disagree: "votes.disagree",
  skip: "votes.skip",
  itsComplicated: "votes.itsComplicated",
} as const;

type HookArgs = {
  statementId: number;
  pollId: number;
};

export const useCardHandlers = ({ statementId, pollId }: HookArgs) => {
  const { track } = useAmplitude();

  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);

  const onSwipe = async (choice: Choice) => {
    startTransition(() => {
      createResponse(statementId, choice);
    });
  };

  const onResponse = (choice: Choice) => {
    track({
      type: choiceEvents[choice],
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
      case "itsComplicated":
        setLeaveY(1000);
        break;
    }

    onSwipe(choice);
  };

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    track({
      type: "drag",
    });

    if (info.offset.x > SWIPE_THRESHOLD) {
      onResponse("agree");
      return;
    }
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onResponse("disagree");
      return;
    }
    if (info.offset.y < -SWIPE_THRESHOLD) {
      onResponse("skip");
      return;
    }
    if (info.offset.y > SWIPE_THRESHOLD) {
      onResponse("itsComplicated");
    }
  };

  return { leaveX, leaveY, onResponse, onDragEnd };
};
