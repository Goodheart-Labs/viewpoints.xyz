"use client";

import ControlledInput from "@/components/ui/ControlledInput";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";
import { pullAllBy, set, values } from "lodash/fp";
import axios from "axios";
import LoadingText from "@/components/ui/LoadingText";

// Config
// -----------------------------------------------------------------------------

const NUM_DEFAULT_COMMENTS = 10;
const AUTOGENERATE_AMOUNT = 10;

// Types
// -----------------------------------------------------------------------------

type CommentsListProps = {
  data: {
    title: string;
    question: string;
  };
  callbacks: {
    onCommentsChange: (comments: string[]) => void;
  };
};

type CommentsListViewProps = {
  state: {
    comments: Comment[];
    canAutogenerate: boolean;
    isAutogenerating: boolean;
    hasAutogenerated: boolean;
    autogeneratingError: string | null;
  };
  callbacks: {
    onClickAddComment: () => void;
    onClickRemoveComment: (key: string) => void;
    onClickAutogenerate: () => void;
    onChangeComment: (key: string, comment: string) => void;
  };
};

type Comment = { key: string; comment: string };

// View
// -----------------------------------------------------------------------------

const CommentsListView = ({
  state: {
    comments,
    canAutogenerate,
    isAutogenerating,
    hasAutogenerated,
    autogeneratingError,
  },
  callbacks: {
    onClickAddComment,
    onClickRemoveComment,
    onClickAutogenerate,
    onChangeComment,
  },
}: CommentsListViewProps) => (
  <div className="flex flex-col">
    <div className="mb-4">
      {canAutogenerate ? (
        <a
          href="#"
          className={clsx(
            "font-semibold underline hover:no-underline",
            isAutogenerating && "cursor-wait no-underline"
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
              Autogenerating {AUTOGENERATE_AMOUNT} comments
            </LoadingText>
          ) : (
            `Autogenerate ${AUTOGENERATE_AMOUNT}${
              hasAutogenerated ? " more" : ""
            } comments`
          )}
        </a>
      ) : null}

      {autogeneratingError ? (
        <>
          {" "}
          <span className="mx-2">&middot;</span>
          <span className="text-red-800">
            Something went wrong while autogenerating comments. Please try
            again.
          </span>
        </>
      ) : null}
    </div>

    {comments.map(({ key, comment }) => (
      <div key={key} className="flex items-center justify-between mb-4">
        <div className="w-full">
          <ControlledInput
            className="w-full text-lg"
            value={comment}
            onChange={(val) => onChangeComment(key, val)}
          />
        </div>

        <div className="w-fit">
          <a
            className="w-10 text-red-900 hover:text-red-500"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClickRemoveComment(key);
            }}
          >
            <MinusCircleIcon className="w-6 ml-2" />
          </a>
        </div>
      </div>
    ))}

    <div className="flex justify-start w-full mb-20">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClickAddComment();
        }}
        className="flex items-center justify-between text-green-700 hover:text-green-500"
      >
        <PlusCircleIcon className="w-6 mr-1" /> Add Comment
      </a>
    </div>
  </div>
);

// Utils
// -----------------------------------------------------------------------------

const newComment = (comment: string): Comment => ({
  key: v4(),
  comment,
});

const defaultComments = new Array(NUM_DEFAULT_COMMENTS)
  .fill(null)
  .map(() => newComment(""));

// Default export
// -----------------------------------------------------------------------------

const CommentsList = ({
  data: { title, question },
  callbacks: { onCommentsChange },
}: CommentsListProps) => {
  // State

  const [comments, setComments] = useState<Comment[]>(defaultComments);
  const [isAutogenerating, setIsAutogenerating] = useState(false);
  const [hasAutogenerated, setHasAutogenerated] = useState(false);
  const [autogeneratingError, setAutogeneratingError] = useState<string | null>(
    null
  );

  // Callbacks

  const onClickAddComment = useCallback(
    () => setComments((comments) => comments.concat(newComment(""))),
    []
  );

  const onClickRemoveComment = useCallback(
    (key: string) =>
      setComments((comments) => pullAllBy("key", [{ key }], comments)),
    []
  );

  const onClickAutogenerate = useCallback(async () => {
    setIsAutogenerating(true);
    setAutogeneratingError(null);

    let autogeneratedComments: string[] = [];

    try {
      const { data } = await axios.post("/api/completions", {
        title,
        question,
      });
      autogeneratedComments = data;
    } catch (e) {
      setAutogeneratingError(
        "Something went wrong while autogenerating comments. Please try again."
      );
      setIsAutogenerating(false);

      return;
    }

    // TODO: unit tests

    setComments((comments) => {
      const autogeneratedCommentsWithKeys =
        autogeneratedComments.map(newComment);

      const commentsValues = values(comments);

      if (commentsValues.some(({ comment }) => comment.trim() === "")) {
        let newComments = comments;

        // Take two counters. The first represents the generated comments that
        // we've actually inserted. The second represents the index of the
        // existing comment we're looking at.

        let commentsInserted = 0;
        let remainingCommentsToLookAt = autogeneratedCommentsWithKeys.length;

        // Keep looping on our remainingCommentsToLookAt

        for (let index = 0; index < remainingCommentsToLookAt; index++) {
          const comment = autogeneratedCommentsWithKeys[commentsInserted];

          // If !commentsValues[index], then we've reached the end of the array
          // and we'll need to go ahead and insert, remembering to mark it.

          if (!commentsValues[index]) {
            newComments = set(index, comment, newComments);
            commentsInserted++;

            continue;
          }

          // If there is a value, but it's empty, then we can use the slot.

          if (commentsValues[index].comment.trim() === "") {
            newComments = set(index, comment, newComments);
            commentsInserted++;

            continue;
          }

          // Otherwise, it's not empty, so we should bump up our remaining
          // comments counter by one and move forward.

          remainingCommentsToLookAt++;
        }

        return newComments;
      }

      return comments.concat(autogeneratedCommentsWithKeys);
    });

    setHasAutogenerated(true);
    setIsAutogenerating(false);
  }, [question, title]);

  const onChangeComment = useCallback(
    (key: string, comment: string) => [
      setComments((comments) => {
        console.log(
          comments,
          key,
          comment,
          comments.findIndex((c) => c.key === key)
        );
        return set(
          comments.findIndex((c) => c.key === key),
          { key, comment },
          comments
        );
      }),
    ],
    []
  );

  // Effects

  const commentsRef = useRef<Comment[]>(defaultComments);
  useEffect(() => {
    if (commentsRef.current === comments) return;
    commentsRef.current = comments;
    onCommentsChange(comments.map(({ comment }) => comment));
  }, [comments, onCommentsChange]);

  // Final state

  const canAutogenerate = useMemo(
    () => Boolean(title && question),
    [title, question]
  );

  // Render

  return (
    <CommentsListView
      state={{
        comments,
        canAutogenerate,
        isAutogenerating,
        hasAutogenerated,
        autogeneratingError,
      }}
      callbacks={{
        onClickAddComment,
        onClickRemoveComment,
        onClickAutogenerate,
        onChangeComment,
      }}
    />
  );
};

export default CommentsList;