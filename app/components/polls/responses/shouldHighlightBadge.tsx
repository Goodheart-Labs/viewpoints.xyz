import type { SortKey, ChoicePercentages } from "@/lib/pollResults/constants";
import type { Response } from "@/db/schema";

/**
 * Determines whether a badge should be highlighted based on the sort type, vote percentages, and choice type.
 *
 * @param sortType - The sort type used to determine the highlighting logic.
 * @param votePercentages - The vote percentages for each choice.
 * @param choiceType - The type of choice.
 * @return Whether the badge should be highlighted.
 */

export function shouldHighlightBadge(
  sortType: SortKey,
  votePercentages: ChoicePercentages,
  choiceType: Response["choice"],
) {
  if (sortType === "consensus") {
    const nonSkipPercentageList = (["agree", "disagree"] as const).map(
      (choice) => votePercentages.get(choice)!,
    );
    const highestPercentage = Math.max(...nonSkipPercentageList);
    return votePercentages.get(choiceType) === highestPercentage;
  }

  if (sortType === "conflict")
    return ["agree", "disagree"].includes(choiceType!);

  if (sortType === "confusion") return choiceType === "skip";

  return false;
}
