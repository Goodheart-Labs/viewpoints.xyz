import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import BorderedButton from "./BorderedButton";
import { MinimalResponse } from "./Cards";
import { Comment, Valence } from "@/lib/api";
import { useCallback, useMemo, useState } from "react";

// Types
// -----------------------------------------------------------------------------

// MinimalResponse is used so that we can display the responses from the user's local state,
// without a round trip to the DB.

type ResponseWithComment = MinimalResponse & {
  comment: Comment;
};

type ResponsesViewProps = {
  data: {
    responsesWithComments: ResponseWithComment[];
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
  comments: Comment[];
};

// Views
// -----------------------------------------------------------------------------

const valenceBaseClasses =
  "mr-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ring-1 ring-inset";

const ValenceBadge = ({ valence }: { valence: Valence }) =>
  valence === "agree" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-green-700 bg-green-50 ring-green-600/20"
      )}
    >
      A
    </span>
  ) : valence === "disagree" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-red-700 bg-red-50 ring-red-600/10"
      )}
    >
      D
    </span>
  ) : valence === "skip" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-yellow-800 bg-yellow-50 ring-yellow-600/20"
      )}
    >
      S
    </span>
  ) : valence === "itsComplicated" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-orange-600 bg-orange-50 ring-orange-600/10"
      )}
    >
      ?
    </span>
  ) : null;

const ResponsesView = ({
  data: { responsesWithComments },
  state: { viewAll },
  callbacks: { onClickViewAll },
}: ResponsesViewProps) => (
  <div className="flex flex-col mt-4 mb-8">
    <AnimatePresence>
      {responsesWithComments.map((response, i) => (
        <motion.div
          key={response.comment_id}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1 - (viewAll ? 0 : i * 0.2), y: 0 }}
          className="flex items-center w-full mb-4"
        >
          <ValenceBadge valence={response.valence} />{" "}
          <span className="text-sm w-60 sm:w-96">
            {response.comment.comment}
          </span>
        </motion.div>
      ))}
    </AnimatePresence>

    {!viewAll && (
      <div className="flex justify-center mt-2">
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

const Responses = ({ responses, comments }: ResponsesProps) => {
  const [viewAll, setViewAll] = useState(false);

  const onClickViewAll = useCallback(() => setViewAll(true), []);

  const responsesWithComments = useMemo(
    () =>
      responses
        .map((r) => ({
          ...r,
          comment: comments.find((c) => c.id === r.comment_id) as Comment,
        }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, viewAll ? responses.length : 5),
    [responses, viewAll, comments]
  );

  return (
    <ResponsesView
      data={{ responsesWithComments }}
      state={{ viewAll }}
      callbacks={{ onClickViewAll }}
    />
  );
};

export default Responses;
