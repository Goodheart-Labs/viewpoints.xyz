import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import BorderedButton from "./BorderedButton";
import { MinimalResponse } from "./Cards";
import { Comment, Valence } from "@/lib/api";
import { useCallback, useMemo, useState } from "react";
import ValenceBadge from "./ValenceBadge";

// Config
// -----------------------------------------------------------------------------

const NUM_VISIBLE_RESPONSES = 5;

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
  comments: Comment[];
};

// Views
// -----------------------------------------------------------------------------

const ResponsesView = ({
  data: { responsesWithComments, totalResponses },
  state: { viewAll },
  callbacks: { onClickViewAll },
}: ResponsesViewProps) => (
  <div className="flex flex-col mx-auto mt-4 mb-8">
    <AnimatePresence>
      {responsesWithComments.map((response, i) => (
        <motion.div
          key={response.comment_id}
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: 1 - (viewAll ? 0 : i * (1 / NUM_VISIBLE_RESPONSES)),
            y: 0,
          }}
          className="flex items-center w-full mb-4"
        >
          <ValenceBadge valence={response.valence} />{" "}
          <span className="text-sm w-60 sm:w-96">
            {response.comment.comment}
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
        .slice(0, viewAll ? responses.length : NUM_VISIBLE_RESPONSES),
    [responses, viewAll, comments]
  );

  return (
    <ResponsesView
      data={{ responsesWithComments, totalResponses: responses.length }}
      state={{ viewAll }}
      callbacks={{ onClickViewAll }}
    />
  );
};

export default Responses;
