"use client";

import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";

import { useUser } from "@clerk/nextjs";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/20/solid";
import type { FlaggedStatement, Statement } from "@prisma/client";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import Head from "next/head";
import { getCookie } from "typescript-cookie";

import JiggleDiv from "@/components/animations/JiggleDiv";
import BorderedButton from "@/components/BorderedButton";
import type { MinimalResponse } from "@/components/Cards";
import Cards from "@/components/Cards";
import NewStatement from "@/components/NewStatement";
import Responses from "@/components/Responses";
import type {
  CreateStatementBody,
  Response,
  StatementWithAuthor,
} from "@/lib/api";
import { Poll } from "@/lib/api";
import sortBySeed from "@/lib/sortBySeed";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import type { InteractionMode } from "@/providers/AmplitudeProvider/types";
import { useModal } from "@/providers/ModalProvider";
import { SESSION_ID_COOKIE_NAME } from "@/providers/SessionProvider";
import { ensureItLooksLikeAQuestion } from "@/utils/stringutils";

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;
const MAX_NUM_SKIPS_BEFORE_REMOVAL = 5;

type PollProps = {
  poll: Poll;
  statements: StatementWithAuthor[];
  url: string;
};

const Poll: FC<PollProps> = ({ poll, statements: initialData, url }) => {
  const { track } = useAmplitude();
  const { user } = useUser();

  // State

  const [isCreating, setIsCreating] = useState(false);

  const [cachedResponses, setCachedResponses] = useState<MinimalResponse[]>([]);

  // Sharing

  const twitterShareUrl = useMemo(
    () =>
      `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`,
    [poll.id, url],
  );

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

  const { setModal } = useModal();

  const onNewPoll = useCallback(() => {
    track({
      type: "polls.new.open",
    });
    setModal({
      render: () => (
        <div>
          <h1>Coming Soon</h1>
        </div>
      ),
    });
  }, [setModal, track]);

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

  // Keep track of pages that have been viewed already

  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const visitedPages =
      JSON.parse(localStorage.getItem("visitedPages") ?? "{}") || {};
    const { pathname } = window.location;

    if (!visitedPages[pathname]) {
      visitedPages[pathname] = true;
      setIsFirstVisit(true);
      localStorage.setItem("visitedPages", JSON.stringify(visitedPages));
    }
  }, []);

  // Render

  return (
    <main className="flex flex-col items-center w-full min-h-screen px-4 gradient sm:px-0">
      <Head>
        <title>{poll.title}</title>
        <meta name="description" content={poll.core_question} />
        <meta property="og:title" content={poll.title} />
        <meta property="og:description" content={poll.core_question} />
        <meta property="og:url" content={twitterShareUrl} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={poll.title} />
        <meta property="twitter:description" content={poll.core_question} />
        <meta property="twitter:site" content="viewpoints.xyz" />
      </Head>

      <div className="flex flex-col mt-10 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">
          {ensureItLooksLikeAQuestion(poll.core_question)}{" "}
          {user?.id ? `Answer as ${user?.firstName}` : "Answer anonymously."}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-20 mt-20 justify-items-center items-end max-width-[800px]">
        {isFirstVisit && (
          <div
            className="absolute top-0 left-0 z-40 w-full h-full bg-black bg-opacity-50 sm:hidden"
            onClick={() => setIsFirstVisit(false)}
          >
            <div className="flex flex-col items-center justify-center w-full h-full">
              <h1 className="px-4 text-3xl font-bold text-center text-gray-200">
                Swipe left or right to answer
              </h1>
              <div className="flex mt-20">
                <p>
                  <ArrowLeftIcon className="w-20 h-20 text-gray-200" />
                </p>
                <p>
                  <ArrowRightIcon className="w-20 h-20 text-gray-200" />
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          {loading ? (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
              <div className="w-10 h-10 border-2 border-t-2 border-gray-200 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center text-gray-400 dark:text-gray-600">
              <JiggleDiv className="hidden mt-8 ml-4 mr-12 sm:block">
                Swipe
                <ArrowLeftIcon className="w-10 h-10" />
              </JiggleDiv>

              <div className="relative text-black">
                <Cards
                  statements={statements ?? []}
                  filteredStatements={filteredStatements ?? []}
                  allResponses={allResponses ?? []}
                  userResponses={enrichedResponses}
                  onNewStatement={onNewStatement}
                  onNewPoll={onNewPoll}
                  onStatementFlagged={refetchFlaggedStatements}
                  onResponseCreated={onResponseCreated}
                />
              </div>

              <JiggleDiv
                transition={{ delay: 1 }}
                className="hidden mt-8 ml-12 mr-4 text-gray-400 dark:text-gray-600 sm:block"
              >
                Swipe
                <ArrowRightIcon className="w-10 h-10" />
              </JiggleDiv>
            </div>
          )}
        </div>

        {filteredStatements.length > 0 && (
          <div className="mt-10">
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
    </main>
  );
};

export default Poll;
