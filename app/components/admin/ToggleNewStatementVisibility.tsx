import { cn } from "@/utils/style-utils";
import { useOptimistic, useTransition } from "react";
import { toggleNewStatementsVisibility } from "@/app/api/polls/toggleStatementsVisibleByDefault";
import { Loader2 } from "lucide-react";
import { Switch } from "../shadcn/ui/switch";

export const ToggleNewStatementVisibility = ({
  pollId,
  visibleByDefault,
}: {
  pollId: number;
  visibleByDefault: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(
    visibleByDefault,
    (_, newChecked: boolean) => newChecked,
  );
  return (
    <>
      <p className="text-sm text-zinc-600">
        Should statements added by respondents intially be visible or hidden?
      </p>
      <div className="flex items-center space-x-2">
        <label
          key="label-one"
          htmlFor="new-statements-visible-by-default"
          className={cn("text-sm", {
            "text-zinc-300": !optimisticChecked,
            "text-zinc-600": optimisticChecked,
          })}
        >
          Hidden
        </label>
        <Switch
          id="new-statements-visible-by-default"
          className="mx-12"
          checked={optimisticChecked}
          onCheckedChange={(checked) => {
            startTransition(() => {
              setOptimisticChecked(checked);
              toggleNewStatementsVisibility(pollId, checked);
            });
          }}
        />
        <label
          key="label-two"
          htmlFor="new-statements-visible-by-default"
          className={cn("text-sm", {
            "text-zinc-300": optimisticChecked,
            "text-zinc-600": !optimisticChecked,
          })}
        >
          Visible
        </label>
        {isPending ? (
          <Loader2
            className="w-4 h-4 text-zinc-700 animate-spin"
            aria-label="Loading"
          />
        ) : null}
      </div>
    </>
  );
};
