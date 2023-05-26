import { FlagIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import BorderedButton from "./BorderedButton";
import { Comment, FlaggedComment } from "@/lib/api";
import { TrackingEvent, useAmplitude } from "@/providers/AmplitudeProvider";
import { useMutation } from "react-query";
import { useSession } from "@/providers/SessionProvider";

// Types
// -----------------------------------------------------------------------------

type FlagCommentViewProps = {
  data: {
    comment: Comment;
  };
  refs: {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
  };
  state: {
    reason: string;
    setReason: (value: string) => void;
    loading: boolean;
  };
  callbacks: {
    onCancel: () => void;
    onSave: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  };
};

type FlagCommentProps = {
  comment: Comment;
  onCreate: () => void;
  onCancel: () => void;
};

// View
// -----------------------------------------------------------------------------

const FlagCommentView = ({
  refs: { textareaRef },
  state: { reason, setReason, loading },
  callbacks: { onCancel, onSave, onKeyDown },
}: FlagCommentViewProps) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed z-50 flex top-[30vh] bg-white flex-col w-[600px] items-center justify-center rounded-lg"
    >
      <div className="z-50 flex flex-col w-full px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between w-full mb-4">
          <h4 className="font-semibold">Flag Comment</h4>
        </div>
        <div className="flex w-full">
          <textarea
            ref={textareaRef}
            className={
              "text-lg text-gray-800 dark:text-gray-400 p-2 w-full resize-none focus:outline-none focus:text-black hover:bg-gray-100 focus:bg-gray-100"
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Reason for flagging this comment"
          />
        </div>
      </div>
      <div className="w-full px-4 py-4 rounded-b-lg bg-gray-50 sm:px-6">
        <div className="flex justify-end">
          <div>
            <BorderedButton
              onClick={onSave}
              color="red"
              disabled={reason.length === 0 || loading}
            >
              {loading ? (
                <>Loading</>
              ) : (
                <>
                  <FlagIcon width={22} height={22} className="mr-1" /> Flag
                  Comment
                </>
              )}
            </BorderedButton>
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        "fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50",
        "z-40"
      )}
      onClick={onCancel}
    />
  </>
);

// Default export
// -----------------------------------------------------------------------------

const FlagComment = ({ comment, onCreate, onCancel }: FlagCommentProps) => {
  const { amplitude } = useAmplitude();
  const { sessionId } = useSession();

  const [reason, setReason] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }, 0);
  }, []);

  useLayoutEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "inherit";
    textareaRef.current.style.height = `${Math.max(
      textareaRef.current.scrollHeight,
      80
    )}px`;
  }, [reason]);

  const newFlaggedCommentMutation = useMutation(
    async ({ reason }: Pick<FlaggedComment, "reason">) => {
      // TODO
      // const { error } = await client
      //   .from("flagged_comments")
      //   .insert({ comment_id: comment.id, session_id: sessionId, reason });
      // if (error) {
      //   throw error;
      // }
      // onCreate();
    }
  );

  const onSave = useCallback(() => {
    if (!reason.length) return;

    amplitude.track(TrackingEvent.PersistFlagComment, {
      commentId: comment.id,
      reason: reason,
      interactionMode: "click",
    });

    newFlaggedCommentMutation.mutateAsync({
      reason,
    });
  }, [reason, amplitude, comment.id, newFlaggedCommentMutation]);

  return (
    <FlagCommentView
      data={{ comment }}
      refs={{ textareaRef }}
      state={{
        reason,
        setReason,
        loading: newFlaggedCommentMutation.isLoading,
      }}
      callbacks={{ onCancel, onSave, onKeyDown }}
    />
  );
};

export default FlagComment;
