import { useCallback, useMemo, useState } from "react";
import { useMutation } from "react-query";

import axios from "axios";
import clsx from "clsx";

import ChoiceBadge from "@/components/ChoiceBadge";
import type { Correlation } from "@/lib/analytics/statements";
import { getCorrelatedStatementPairs } from "@/lib/analytics/statements";
import type { AnalyticsFilters, Poll, Response, Statement } from "@/lib/api";
import { useAdminState } from "@/providers/AdminStateProvider";

import SelectCorrelatedStatement from "./SelectCorrelatedStatement";

// Config
// -----------------------------------------------------------------------------

const NUM_CORRELATED_COMMENTS = 5;

// Types
// -----------------------------------------------------------------------------

type CorrelatedStatementsViewProps = {
  data: {
    poll: Poll;
    correlatedStatements: Correlation[];
    statementIdToStatementMap: Record<Statement["id"], Statement>;
  };
};

type EditingCorrelatedStatementsViewProps = {
  data: {
    allCorrelatedStatements: Correlation[];
    selectedCorrelatedStatements: Correlation[];
    statementIdToStatementMap: Record<Statement["id"], Statement>;
  };
  state: {
    isLoading: boolean;
    isDefault: boolean;
  };
  callbacks: {
    onSelected: (correlationKey: Correlation["key"]) => void;
    onClickReset: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  };
};

type CorrelatedStatementsProps = {
  poll: Poll;
  statements: Statement[];
  responses: Response[];
};

type EditingCorrelatedStatementsProps = {
  data: {
    poll: Poll;
    allCorrelatedStatements: Correlation[];
    selectedCorrelatedStatements: Correlation[];
    statementIdToStatementMap: Record<Statement["id"], Statement>;
  };
  state: {
    analyticsFilters: AnalyticsFilters;
    setAnalyticsFilters: (analyticsFilters: AnalyticsFilters) => void;
  };
};

// Views
// -----------------------------------------------------------------------------

const EditingCorrelatedStatementsView = ({
  data: {
    selectedCorrelatedStatements,
    allCorrelatedStatements,
    statementIdToStatementMap,
  },
  state: { isLoading, isDefault },
  callbacks: { onSelected, onClickReset },
}: EditingCorrelatedStatementsViewProps) => (
  <div className="flex gap-8">
    <div className="w-1/2">
      <h3 className="flex items-center justify-between mb-4 font-semibold">
        Interestingly Correlated Statements
        {!isDefault && (
          <span>
            <a
              href="#"
              className="text-xs text-gray-500 uppercase dark:text-gray-700"
              onClick={onClickReset}
            >
              Reset
            </a>
          </span>
        )}
      </h3>

      <div className="flex flex-col p-4 border-2 border-dashed rounded-lg">
        <div className="flex flex-col">
          {isDefault ? (
            <div>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                No correlations selected. Displaying defaults.
              </p>
            </div>
          ) : (
            <ul>
              {selectedCorrelatedStatements.map((correlation) => (
                <CorrelatedStatement
                  key={correlation.key}
                  correlation={correlation}
                  statementIdToStatementMap={statementIdToStatementMap}
                />
              ))}
            </ul>
          )}

          <hr className="my-2" />
        </div>

        <div className="flex items-center justify-center w-full">
          <SelectCorrelatedStatement
            disabled={isLoading}
            correlatedStatements={allCorrelatedStatements}
            statementIdToStatementMap={statementIdToStatementMap}
            onSelected={onSelected}
          />
        </div>
      </div>
    </div>
  </div>
);

const CorrelatedStatementsView = ({
  data: { correlatedStatements, statementIdToStatementMap },
}: CorrelatedStatementsViewProps) => (
  <div className="flex gap-8">
    <div className="w-1/2">
      <h3 className="mb-4 font-semibold">
        Interestingly Correlated Statements
      </h3>
      <ul>
        {correlatedStatements.map((correlation) => (
          <CorrelatedStatement
            key={correlation.key}
            statementIdToStatementMap={statementIdToStatementMap}
            correlation={correlation}
          />
        ))}
      </ul>
    </div>
  </div>
);

// Correlated Statement
// -----------------------------------------------------------------------------

const CorrelatedStatement = ({
  correlation: {
    statementA,
    statementB,
    statementAChoice,
    statementBChoice,
    percentage,
  },
  statementIdToStatementMap,
}: {
  correlation: Correlation;
  statementIdToStatementMap: Record<Statement["id"], Statement>;
}) => (
  <li
    className={clsx(
      "flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800",
    )}
    key={[statementA, statementB, statementAChoice, statementBChoice].join(",")}
  >
    <div className="flex items-center justify-between">
      <div>
        <span className="text-lg font-bold">
          {percentage.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
          %
        </span>{" "}
        of respondents who voted{" "}
        <ChoiceBadge choice={statementAChoice}>{statementAChoice}</ChoiceBadge>
        on
      </div>
    </div>

    <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
      <span>{statementIdToStatementMap[statementA]?.text}</span>
    </div>

    <div className="mb-1">
      also voted{" "}
      <ChoiceBadge choice={statementBChoice}>{statementBChoice}</ChoiceBadge> on
    </div>

    <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
      <span>{statementIdToStatementMap[statementB]?.text}</span>
    </div>
  </li>
);

// Editing
// -----------------------------------------------------------------------------

const EditingCorrelatedStatements = ({
  data: {
    poll,
    selectedCorrelatedStatements,
    allCorrelatedStatements,
    statementIdToStatementMap,
  },
  state: { analyticsFilters, setAnalyticsFilters },
}: EditingCorrelatedStatementsProps) => {
  // Mutations

  const updatePollMutation = useMutation(
    async (analytics_filters: AnalyticsFilters) => {
      await axios.patch(`/api/polls/${poll.id}`, {
        analytics_filters,
      });
    },
  );

  // State

  const isLoading = useMemo(
    () => updatePollMutation.isLoading,
    [updatePollMutation],
  );

  const isDefault = useMemo(
    () => (analyticsFilters.correlatedStatements || []).length === 0,
    [analyticsFilters],
  );

  // Callbacks

  const onSelected = useCallback(
    (correlationKey: Correlation["key"]) => {
      const newAnalyticsFilters = {
        ...analyticsFilters,
        correlatedStatements: [
          ...(analyticsFilters.correlatedStatements ?? []),
          correlationKey,
        ],
      };

      setAnalyticsFilters(newAnalyticsFilters);
      updatePollMutation.mutate(newAnalyticsFilters);
    },
    [analyticsFilters, setAnalyticsFilters, updatePollMutation],
  );

  const onClickReset = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const newAnalyticsFilters = {
        ...analyticsFilters,
        correlatedStatements: [],
      };

      setAnalyticsFilters(newAnalyticsFilters);
      updatePollMutation.mutate(newAnalyticsFilters);
    },
    [analyticsFilters, setAnalyticsFilters, updatePollMutation],
  );

  // Render

  return (
    <EditingCorrelatedStatementsView
      data={{
        allCorrelatedStatements,
        selectedCorrelatedStatements,
        statementIdToStatementMap,
      }}
      state={{
        isLoading,
        isDefault,
      }}
      callbacks={{
        onSelected,
        onClickReset,
      }}
    />
  );
};

// Default export
// -----------------------------------------------------------------------------

const CorrelatedStatements = ({
  poll,
  responses,
  statements,
}: CorrelatedStatementsProps) => {
  // Basic data

  const allCorrelatedStatements = useMemo(
    () => getCorrelatedStatementPairs(responses ?? []),
    [responses],
  );

  const statementIdToStatementMap = useMemo(
    () =>
      (statements ?? []).reduce(
        (acc, statement) => ({
          ...acc,
          [statement.id]: statement,
        }),
        {} as Record<Statement["id"], Statement>,
      ),
    [statements],
  );

  // State

  const { adminState } = useAdminState();

  const isEditing = adminState.editingAnalytics;

  // State

  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>(
    (poll.analytics_filters as AnalyticsFilters) ?? {},
  );

  const selectedCorrelatedStatementKeys = useMemo(() => {
    if (
      !analyticsFilters ||
      typeof analyticsFilters !== "object" ||
      !("correlatedStatements" in analyticsFilters)
    ) {
      return [];
    }

    return analyticsFilters.correlatedStatements;
  }, [analyticsFilters]);

  // Filter out hidden statements if not admin

  const correlatedStatements = useMemo(() => {
    if (selectedCorrelatedStatementKeys.length === 0) {
      return allCorrelatedStatements.slice(0, NUM_CORRELATED_COMMENTS);
    }

    return allCorrelatedStatements.filter(({ key }) =>
      selectedCorrelatedStatementKeys.includes(key),
    );
  }, [allCorrelatedStatements, selectedCorrelatedStatementKeys]);

  const selectedCorrelatedStatements = useMemo(
    () =>
      correlatedStatements.filter(({ key }) =>
        selectedCorrelatedStatementKeys.includes(key),
      ),
    [correlatedStatements, selectedCorrelatedStatementKeys],
  );

  // Render

  if (isEditing) {
    return (
      <EditingCorrelatedStatements
        data={{
          poll,
          allCorrelatedStatements,
          selectedCorrelatedStatements,
          statementIdToStatementMap,
        }}
        state={{
          analyticsFilters,
          setAnalyticsFilters,
        }}
      />
    );
  }

  return (
    <CorrelatedStatementsView
      data={{
        poll,
        correlatedStatements,
        statementIdToStatementMap,
      }}
    />
  );
};

export default CorrelatedStatements;
