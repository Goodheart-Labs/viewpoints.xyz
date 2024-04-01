import React from "react";
import { cn } from "@/utils/style-utils";
import type { Response } from "@/db/schema";
import type { ChoiceEnum } from "kysely-codegen";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shadcn/ui/tooltip";
import styles from "./CardButton.module.css";

type CardButtonProps<C extends ChoiceEnum | number> = {
  choice: C;
  choiceText?: string;
  activeChoice?: ChoiceEnum | null;
  onResponse: (choice: C) => void;
  highlight?: boolean;
  withTooltip?: boolean;
};

export const CardButton = <C extends ChoiceEnum | number>({
  choice,
  choiceText,
  activeChoice,
  onResponse,
  highlight,
  withTooltip = false,
}: CardButtonProps<C>) => {
  const [isHovering, setIsHovering] = React.useState(false);
  const choiceEmoji = getChoiceEmoji(choice as Response["choice"]);

  /**
   * Check if the specified type of choice is active
   * @param type
   */
  const isActiveChoiceType = (type: string) =>
    [choice, activeChoice].every((c) => c === type) ||
    (isHovering && type === choice);

  const extraButtonStyles = cn({
    "rounded-full w-max grid place-content-center transition transition-colors":
      !!choiceEmoji,
    "text-2xl w-[56px] h-[56px]":
      !!choiceEmoji && ["👎", "👍"].includes(choiceEmoji),
    "w-10 h-10 text-base": choiceEmoji === "🤷",
    [styles.agree]: isActiveChoiceType("agree"),
    [styles.disagree]: isActiveChoiceType("disagree"),
    [styles.skip]: isActiveChoiceType("skip"),
  });

  const button = (
    <button
      type="button"
      onClick={() => onResponse(choice)}
      className={cn(
        "bg-zinc-700 hover:bg-zinc-600 rounded-full aspect-square text-white transition-colors duration-200",
        typeof choice === "string" ? getButtonSize(choice) : false,
        choiceText && "rounded-md px-3 py-1 text-sm aspect-auto w-full mb-3",
        highlight && "bg-zinc-600",
        extraButtonStyles,
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      {choiceEmoji ? (
        <div className="drop-shadow-xl pointer-events-none">{choiceEmoji}</div>
      ) : (
        choiceText
      )}
    </button>
  );

  if (!withTooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{choiceText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const getButtonSize = (choice: Response["choice"]) => {
  switch (choice) {
    case "agree":
    case "disagree":
      return "w-14";
  }

  return "w-10";
};

export const getChoiceEmoji = (choice: Response["choice"]) => {
  switch (choice) {
    case "agree":
      return "👍";
    case "disagree":
      return "👎";
    case "skip":
      return "🤷";
  }

  return null;
};
