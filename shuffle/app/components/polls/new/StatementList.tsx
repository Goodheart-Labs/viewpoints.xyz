"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { useForm } from "react-hook-form";

import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import clsx from "clsx";
import { pullAllBy, set, values } from "lodash/fp";
import { v4 } from "uuid";

import ControlledInput from "@/components/ui/ControlledInput";
import LoadingText from "@/components/ui/LoadingText";

// Config
// -----------------------------------------------------------------------------

const MIN_STATEMENTS = 5;
const AUTOGENERATE_AMOUNT = 10;

// Types
// -----------------------------------------------------------------------------

type FormErrors = ReturnType<
  typeof useForm<{
    statements: string[];
  }>
>["formState"]["errors"];

type StatementsListProps = {
  data: {
    title: string;
    question: string;
  };
  state: {
    errors: FormErrors;
  };
  callbacks: {
    onStatementsChange: (statements: string[]) => void;
    onStatementsBlur: (statements: string[]) => void;
  };
};

type StatementsListViewProps = {
  state: {
    statements: Statement[];
    errors: FormErrors;
    canAutogenerate: boolean;
    isAutogenerating: boolean;
    hasAutogenerated: boolean;
    autogeneratingError: string | null;
  };
  callbacks: {
    onClickAddStatement: () => void;
    onClickRemoveStatement: (key: string) => void;
    onClickAutogenerate: () => void;
    onChangeStatement: (key: string, statement: string) => void;
    onBlurStatement: (key: string, statement: string) => void;
  };
};

type Statement = { key: string; statement: string };

// View
// -----------------------------------------------------------------------------

const StatementsListView = ({
  state: {
    statements,
    errors,
    canAutogenerate,
    isAutogenerating,
    hasAutogenerated,
    autogeneratingError,
  },
  callbacks: {
    onClickAddStatement,
    onClickRemoveStatement,
    onClickAutogenerate,
    onChangeStatement,
    onBlurStatement,
  },
}: StatementsListViewProps) => (
  <div className="flex flex-col">
    <div className="mb-4">
      {canAutogenerate ? (
        <a
          href="#"
          className={clsx(
            "font-semibold underline hover:no-underline",
            isAutogenerating && "cursor-wait no-underline",
          )}
          onClick={(e) => {
            e.preventDefault();
            if (isAutogenerating) return;
            onClickAutogenerate();
          }}
          aria-disabled={isAutogenerating}
        >
          {isAutogenerating ? (
            <LoadingText>
              Autogenerating {AUTOGENERATE_AMOUNT} statements
            </LoadingText>
          ) : (
            `Autogenerate ${AUTOGENERATE_AMOUNT}${
              hasAutogenerated ? " more" : ""
            } statements`
          )}
        </a>
      ) : null}

      {autogeneratingError ? (
        <>
          {" "}
          <span className="mx-2">&middot;</span>
          <span className="text-red-800">
            Something went wrong while autogenerating statements. Please try
            again.
          </span>
        </>
      ) : null}
    </div>

    {statements.map(({ statement }) => statement).filter(Boolean).length <
    MIN_STATEMENTS ? (
      <span className="mb-4 text-sm text-red-500">
        You need at least 5 statements
      </span>
    ) : null}

    {statements.map(({ key, statement }, i) => (
      <div key={key} className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-full">
            <ControlledInput
              className="w-full text-lg"
              value={statement}
              onChange={(val) => onChangeStatement(key, val)}
              onBlur={(val) => onBlurStatement(key, val.target.value)}
            />
          </div>

          {statements.length > MIN_STATEMENTS ? (
            <div className="w-fit">
              <a
                className="w-10 text-red-900 hover:text-red-500"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClickRemoveStatement(key);
                }}
              >
                <MinusCircleIcon className="w-6 ml-2" />
              </a>
            </div>
          ) : null}
        </div>

        {errors?.statements && errors?.statements[i] ? (
          <span className="mt-1 text-sm text-red-500">
            {errors?.statements?.[i]?.message}
          </span>
        ) : null}
      </div>
    ))}

    <div className="flex justify-start w-full mb-20">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClickAddStatement();
        }}
        className="flex items-center justify-between text-green-700 hover:text-green-500"
      >
        <PlusCircleIcon className="w-6 mr-1" /> Add Statement
      </a>
    </div>
  </div>
);

// Utils
// -----------------------------------------------------------------------------

const newStatement = (statement: string): Statement => ({
  key: v4(),
  statement,
});

const defaultStatements = new Array(MIN_STATEMENTS)
  .fill(null)
  .map(() => newStatement(""));

// Default export
// -----------------------------------------------------------------------------

const StatementsList = ({
  data: { title, question },
  state: { errors },
  callbacks: { onStatementsChange, onStatementsBlur },
}: StatementsListProps) => {
  // State

  const [statements, setStatements] = useState<Statement[]>(defaultStatements);
  const [isAutogenerating, setIsAutogenerating] = useState(false);
  const [hasAutogenerated, setHasAutogenerated] = useState(false);
  const [autogeneratingError, setAutogeneratingError] = useState<string | null>(
    null,
  );

  // Callbacks

  const onClickAddStatement = useCallback(
    () =>
      setStatements((oldStatements) => oldStatements.concat(newStatement(""))),
    [],
  );

  const onClickRemoveStatement = useCallback(
    (key: string) => {
      if (statements.length < MIN_STATEMENTS) return;
      setStatements((oldStatements) =>
        pullAllBy("key", [{ key }], oldStatements),
      );
    },
    [statements.length],
  );

  const onClickAutogenerate = useCallback(async () => {
    setIsAutogenerating(true);
    setAutogeneratingError(null);

    let autogeneratedStatements: string[] = [];

    try {
      const { data } = await axios.post("/api/completions", {
        title,
        question,
      });
      autogeneratedStatements = data;
    } catch (e) {
      setAutogeneratingError(
        "Something went wrong while autogenerating statements. Please try again.",
      );
      setIsAutogenerating(false);

      return;
    }

    // TODO: unit tests

    setStatements((oldStatements) => {
      const autogeneratedStatementsWithKeys =
        autogeneratedStatements.map(newStatement);

      const statementsValues = values(oldStatements);

      if (statementsValues.some(({ statement }) => statement.trim() === "")) {
        let newStatements = oldStatements;

        // Take two counters. The first represents the generated statements that
        // we've actually inserted. The second represents the index of the
        // existing statement we're looking at.

        let statementsInserted = 0;
        let remainingStatementsToLookAt =
          autogeneratedStatementsWithKeys.length;

        // Keep looping on our remainingStatementsToLookAt

        for (let index = 0; index < remainingStatementsToLookAt; index++) {
          const statement = autogeneratedStatementsWithKeys[statementsInserted];

          // If !statementsValues[index], then we've reached the end of the array
          // and we'll need to go ahead and insert, remembering to mark it.

          if (!statementsValues[index]) {
            newStatements = set(index, statement, newStatements);
            statementsInserted++;

            continue;
          }

          // If there is a value, but it's empty, then we can use the slot.

          if (statementsValues[index].statement.trim() === "") {
            newStatements = set(index, statement, newStatements);
            statementsInserted++;

            continue;
          }

          // Otherwise, it's not empty, so we should bump up our remaining
          // statements counter by one and move forward.

          remainingStatementsToLookAt++;
        }

        return newStatements;
      }

      return oldStatements.concat(autogeneratedStatementsWithKeys);
    });

    setHasAutogenerated(true);
    setIsAutogenerating(false);
  }, [question, title]);

  const onChangeStatement = useCallback(
    (key: string, statement: string) => [
      setStatements((oldStatements) =>
        set(
          oldStatements.findIndex((c) => c.key === key),
          { key, statement },
          oldStatements,
        ),
      ),
    ],
    [],
  );

  const onBlurStatement = useCallback(
    () => onStatementsBlur(statements.map(({ statement }) => statement)),
    [statements, onStatementsBlur],
  );

  // Effects

  const statementsRef = useRef<Statement[]>(defaultStatements);
  useEffect(() => {
    if (statementsRef.current === statements) return;
    statementsRef.current = statements;
    onStatementsChange(
      statements.filter(Boolean).map(({ statement }) => statement),
    );
  }, [statements, onStatementsChange]);

  // Final state

  const canAutogenerate = useMemo(
    () => Boolean(title && question),
    [title, question],
  );

  // Render

  return (
    <StatementsListView
      state={{
        statements,
        errors,
        canAutogenerate,
        isAutogenerating,
        hasAutogenerated,
        autogeneratingError,
      }}
      callbacks={{
        onClickAddStatement,
        onClickRemoveStatement,
        onClickAutogenerate,
        onChangeStatement,
        onBlurStatement,
      }}
    />
  );
};

export default StatementsList;