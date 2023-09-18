"use client";

import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";

import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/20/solid";
import type { FlaggedStatement, Statement } from "@prisma/client";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { getCookie } from "typescript-cookie";

import { CommentsSheet } from "@/app/components/polls/comments/CommentsSheet";
import BorderedButton from "@/components/BorderedButton";
import type { MinimalResponse } from "@/components/Cards";
import Cards from "@/components/Cards";
import NewStatement from "@/components/NewStatement";
import Responses from "@/components/Responses";
import type {
  CommentWithAuthor,
  CreateStatementBody,
  Response,
  StatementWithAuthor,
} from "@/lib/api";
import { Poll } from "@/lib/api";
import sortBySeed from "@/lib/sortBySeed";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import type { InteractionMode } from "@/providers/AmplitudeProvider/types";
import { SESSION_ID_COOKIE_NAME } from "@/providers/SessionProvider";
import { ensureItLooksLikeAQuestion } from "@/utils/stringutils";

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;
const MAX_NUM_SKIPS_BEFORE_REMOVAL = 5;

type PollProps = {
  poll: Poll;
  statements: StatementWithAuthor[];
  comments: CommentWithAuthor[];
};

const Poll: FC<PollProps> = ({ poll, statements: initialData, comments }) => {
  const { track } = useAmplitude();
  const { user } = useUser();

  // State

  const [isCreating, setIsCreating] = useState(false);

  const [cachedResponses, setCachedResponses] = useState<MinimalResponse[]>([]);

  // Queries

  const { data: statements, refetch: refetchStatements } = useQuery<
    StatementWithAuthor[]
  >(
    ["statements", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/statements`);
      return data as StatementWithAuthor[];
    },
    {
      initialData,
    },
  );

  const statementIds = useMemo(
    () => (statements ?? []).map((statement) => statement.id),
    [statements],
  );

  const userId = useMemo(
    () =>
      user?.id ??
      (typeof document === "undefined"
        ? undefined
        : getCookie(SESSION_ID_COOKIE_NAME)),
    [user?.id],
  );

  const { data: responses, isLoading: responsesLoading } = useQuery<Response[]>(
    [userId, "responses", statementIds.join(",")],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/responses`);
      return data as Response[];
    },
  );

  const { data: allResponses, refetch: refetchAllResponses } = useQuery<
    Response[]
  >(["responses", statementIds.join(",")], async () => {
    const { data } = await axios.get(`/api/polls/${poll.id}/responses/all`);
    return data as Response[];
  });

  const { data: flaggedStatements, refetch: refetchFlaggedStatements } =
    useQuery<FlaggedStatement[]>(
      ["flaggedStatements", statementIds.join(",")],
      async () => {
        const { data } = await axios.get(
          `/api/polls/${poll.id}/flaggedStatements`,
        );
        return data as FlaggedStatement[];
      },
    );

  const newStatementMutation = useMutation(
    async (payload: CreateStatementBody): Promise<void> => {
      await axios.post<unknown, unknown, CreateStatementBody>(
        `/api/polls/${poll.id}/statements`,
        payload,
      );
      await refetchStatements();
    },
  );

  // Callbacks

  const onNewStatement = useCallback(
    (interactionMode: InteractionMode = "click") => {
      setIsCreating(true);

      track({
        type: "statement.new.open",
        pollId: poll.id,
        interactionMode,
      });
    },
    [poll.id, track],
  );

  const onCreateStatement = useCallback(
    async (text: Statement["text"]) => {
      track({
        type: "statement.new.persist",
        pollId: poll.id,
        text,
      });

      await newStatementMutation.mutateAsync({
        text,
      });
      setIsCreating(false);
    },
    [newStatementMutation, poll.id, track],
  );

  const onCancelCreating = useCallback(() => {
    track({
      type: "statement.new.cancel",
      pollId: poll.id,
    });

    setIsCreating(false);
  }, [track, poll.id]);

  const onResponseCreated = useCallback(
    async (response: MinimalResponse) => {
      setCachedResponses((cr) => [...cr, response]);
      await refetchAllResponses();
    },
    [refetchAllResponses],
  );

  // Keyboard shortcuts

  useHotkeys("c", () => onNewStatement("keyboard"));

  // Memos

  const flagCountByStatementId = useMemo(
    () =>
      (flaggedStatements ?? []).reduce(
        (acc, flaggedStatement) => ({
          ...acc,
          [flaggedStatement.statementId]:
            (acc[flaggedStatement.statementId] ?? 0) + 1,
        }),
        {} as Record<number, number>,
      ),
    [flaggedStatements],
  );

  const skipCountByStatementId = useMemo(
    () =>
      (responses ?? []).reduce(
        (acc, response) => ({
          ...acc,
          [response.statementId]:
            (acc[response.statementId] ?? 0) +
            (response.choice === "skip" ? 1 : 0),
        }),
        {} as Record<number, number>,
      ),
    [responses],
  );

  const enrichedResponses = useMemo(
    () =>
      [...(responses || []), ...cachedResponses].filter(
        (response, index, self) =>
          self.findIndex((r) => r.statementId === response.statementId) ===
          index,
      ),
    [responses, cachedResponses],
  );

  const currentUserResponsesByStatementId = useMemo(
    () =>
      enrichedResponses?.reduce(
        (acc, response) => ({
          ...acc,
          [response.statementId]: response,
        }),
        {} as Record<number, MinimalResponse>,
      ) ?? {},
    [enrichedResponses],
  );

  const loading = useMemo(() => responsesLoading, [responsesLoading]);

  // Sort deterministically by seed before we filter

  // Generate a seed for sorting statements

  const [seed, setSeed] = useState(Math.random());
  useEffect(() => {
    const storedSeed = localStorage.getItem("seed");
    if (storedSeed) {
      setSeed(parseFloat(storedSeed));
    } else {
      localStorage.setItem("seed", Math.random().toString());
    }
  }, []);

  const sortedStatements = useMemo(
    () => sortBySeed(statements ?? [], seed),
    [statements, seed],
  );

  // Filter statements

  const filteredStatements = useMemo(
    () =>
      (sortedStatements ?? []).filter((statement) => {
        const userHasResponded =
          !!currentUserResponsesByStatementId[statement.id];

        const statementHasBeenFlaggedByCurrentUser = flaggedStatements?.some(
          (flaggedStatement) =>
            flaggedStatement.statementId === statement.id &&
            (flaggedStatement.session_id ===
              getCookie(SESSION_ID_COOKIE_NAME) ||
              (user?.id && flaggedStatement.user_id === user.id)),
        );

        const statementExceedsFlagThreshold =
          (flagCountByStatementId[statement.id] ?? 0) >=
          MAX_NUM_FLAGS_BEFORE_REMOVAL;

        const statementExceedsSkipThreshold =
          (skipCountByStatementId[statement.id] ?? 0) >=
          MAX_NUM_SKIPS_BEFORE_REMOVAL;

        return !(
          userHasResponded ||
          statementHasBeenFlaggedByCurrentUser ||
          statementExceedsFlagThreshold ||
          statementExceedsSkipThreshold
        );
      }),
    [
      currentUserResponsesByStatementId,
      flagCountByStatementId,
      flaggedStatements,
      skipCountByStatementId,
      sortedStatements,
      user?.id,
    ],
  );

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-black xl:p-8 xl:flex-row xl:justify-center xl:gap-8 xl:overflow-y-hidden">
      <div className="hidden xl:block w-2/7" />

      <div className="flex flex-col items-center gap-4 max-w-full xl:w-3/7 p-4 text-center h-full xl:bg-zinc-900 xl:rounded-xl xl:max-h-full xl:overflow-y-auto overflow-x-hidden lg:py-6">
        <h1 className="text-4xl font-bold text-foreground">{poll.title}</h1>
        <h2 className=" xl:text-xl text-muted mb-8">
          {ensureItLooksLikeAQuestion(poll.core_question)} {getUserName(user)}
        </h2>

        <div>
          {loading ? (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
              <div className="w-10 h-10 border-2 border-t-2 border-gray-200 rounded-full animate-spin" />
            </div>
          ) : (
            <Cards
              statements={statements ?? []}
              filteredStatements={filteredStatements ?? []}
              allResponses={allResponses ?? []}
              userResponses={enrichedResponses}
              onNewStatement={onNewStatement}
              onStatementFlagged={refetchFlaggedStatements}
              onResponseCreated={onResponseCreated}
            />
          )}
        </div>

        {filteredStatements.length > 0 && (
          <div className="my-3">
            <BorderedButton
              onClick={() => onNewStatement("click")}
              color="blue"
            >
              <ChatBubbleBottomCenterIcon width={22} className="mr-2" />
              Add New Statement
            </BorderedButton>
          </div>
        )}

        {responses && statements && (
          <Responses
            allResponses={allResponses ?? []}
            responses={enrichedResponses}
            statements={statements}
          />
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <NewStatement
            onCreate={onCreateStatement}
            onCancel={onCancelCreating}
          />
        )}
      </AnimatePresence>

      <CommentsSheet comments={comments} />
    </main>
  );
};

const getUserName = (user: UserResource | null | undefined) => {
  if (!user) {
    return "Answer anonymously.";
  }

  if (user.firstName) {
    return `Answer as ${user.firstName}.`;
  }

  return `Answer as ${user.primaryEmailAddress?.emailAddress}.`;
};

export default Poll;
