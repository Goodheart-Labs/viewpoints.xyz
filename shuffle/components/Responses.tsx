import { useCallback, useMemo, useState } from "react";

import type { Statement } from "@prisma/client";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";

import type { ResponsePercentages } from "@/lib/analytics/responses";
import { calculateResponsePercentages } from "@/lib/analytics/responses";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { choiceToHumanReadablePastTense } from "@/utils/choiceUtils";

import BorderedButton from "./BorderedButton";
import type { MinimalResponse } from "./Cards";
import ChoiceBadge from "./ChoiceBadge";

// Config
// -----------------------------------------------------------------------------

const NUM_VISIBLE_RESPONSES = 5;

// Types
// -----------------------------------------------------------------------------

// MinimalResponse is used so that we can display the responses from the user's local state,
// without a round trip to the DB.

type ResponseWithStatement = MinimalResponse & {
  statement: Statement;
};

type ResponsesViewProps = {
  data: {
    responsesWithStatements: ResponseWithStatement[];
    responsePercentages: ResponsePercentages;
    totalResponses: number;
  };
  state: {
    viewAll: boolean;
  };
  callbacks: {
    onClickViewAll: () => void;
  };
};

type ResponsesProps = {
  responses: MinimalResponse[];
  allResponses: MinimalResponse[];
  statements: Statement[];
};

// Views
// -----------------------------------------------------------------------------

const ResponsesView = ({
  data: { responsesWithStatements, responsePercentages, totalResponses },
  state: { viewAll },
  callbacks: { onClickViewAll },
}: ResponsesViewProps) => (
  <div className="flex flex-col mx-auto mb-8">
    <AnimatePresence>
      {responsesWithStatements.map((response, i) => (
        <motion.div
          key={response.statementId}
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1 - (viewAll ? 0 : i * (1 / NUM_VISIBLE_RESPONSES)),
            y: 0,
          }}
          className="flex items-center w-full mb-4"
        >
          <ChoiceBadge choice={response.choice} />

          <span className="ml-2 text-sm w-60 sm:w-96">
            {response.statement.text}
          </span>

          <span
            className="ml-4 text-xs font-bold text-gray-500 dark:text-gray-400"
            data-tooltip-id="tooltip"
            data-tooltip-content={`${(
              responsePercentages.get(response.statementId) ?? 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}% of people also ${choiceToHumanReadablePastTense(
              response.choice,
            )}`}
            data-tooltip-float
            data-tooltip-place="right"
          >
            {(
              responsePercentages.get(response.statementId) ?? 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            %
          </span>
        </motion.div>
      ))}
    </AnimatePresence>

    {!viewAll && totalResponses > NUM_VISIBLE_RESPONSES && (
      <div className="z-30 flex justify-center mt-2">
        <BorderedButton
          color="blue"
          className="text-xs"
          onClick={onClickViewAll}
        >
          View All
        </BorderedButton>
      </div>
    )}
  </div>
);

// Default export
// -----------------------------------------------------------------------------

const Responses = ({ responses, statements, allResponses }: ResponsesProps) => {
  const [viewAll, setViewAll] = useState(false);
  const { track } = useAmplitude();

  const onClickViewAll = useCallback(() => {
    setViewAll(true);
    track({
      type: "votes.viewAll",
    });
  }, [track]);

  const responsesWithStatements = useMemo(
    () =>
      responses
        .map((r) => ({
          ...r,
          statement: statements.find(
            (c) => c.id === r.statementId,
          ) as Statement,
        }))
        .sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)))
        .slice(0, viewAll ? responses.length : NUM_VISIBLE_RESPONSES),
    [responses, viewAll, statements],
  );

  const responsePercentages = useMemo(
    () => calculateResponsePercentages(allResponses, responses),
    [allResponses, responses],
  );

  return (
    <ResponsesView
      data={{
        responsesWithStatements,
        responsePercentages,
        totalResponses: responses.length,
      }}
      state={{ viewAll }}
      callbacks={{ onClickViewAll }}
    />
  );
};

export default Responses;
