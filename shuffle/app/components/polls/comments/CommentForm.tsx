import type { FC } from "react";
import React, { useEffect, useTransition } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";

import { useUser } from "@clerk/nextjs";
import type { Comment } from "@prisma/client";
import { RotateCw, SendHorizontal } from "lucide-react";
import { Key } from "ts-key-enum";

import { createComment } from "@/app/api/comments/createComment";
import { useAutosizeTextArea } from "@/hooks/useAutosizeTextArea";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { useCurrentPoll } from "@/providers/CurrentPollProvider";
import { Textarea } from "@/shadcn/textarea";
import { cn } from "@/utils/style-utils";

import { UserAvatar } from "../../user/UserAvatar";

export type CommentForm = Pick<Comment, "text">;

type Props = {
  form: UseFormReturn<CommentForm>;
  open: () => void;
  onNewComment: () => void;
};

export const CommentForm: FC<Props> = ({
  form: { control, handleSubmit, reset },
  open,
  onNewComment,
}) => {
  const { user } = useUser();

  const { field } = useController({
    control,
    name: "text",
    defaultValue: "",
    rules: {
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
  });

  const textAreaValue = useWatch({
    control,
    name: "text",
  });

  const textAreaRef = useAutosizeTextArea(textAreaValue);

  const [isPending, startTransition] = useTransition();

  const { currentPoll } = useCurrentPoll();

  const { track } = useAmplitude();

  const onSubmit = handleSubmit(({ text }) => {
    if (!currentPoll) return;

    startTransition(() => {
      createComment(currentPoll.id, text).then(() => {
        reset();
        textAreaRef.current?.blur();
        track({
          type: "comment.create",
        });
        onNewComment();
      });
    });
  });

  const onEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === Key.Enter && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      textAreaRef.current?.blur();
    }
  };

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    textArea.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key === Key.Enter && !e.shiftKey) {
          e.preventDefault();

          return false;
        }

        return true;
      },
      true,
    );
  }, [textAreaRef]);

  return (
    <div className="px-5 pt-3 pb-5 flex items-center gap-2 bg-zinc-900 xl:rounded-b-xl border-t border-zinc-800">
      <UserAvatar
        avatarUrl={user?.imageUrl ?? null}
        name={null}
        showName={false}
      />

      <form onSubmit={onSubmit} className="flex-1 flex gap-4">
        <Textarea
          className="bg-zinc-700 w-full max-h-16 touch-auto flex-1 h-11 leading-6"
          {...field}
          placeholder="Write your thought"
          ref={(e) => {
            textAreaRef.current = e;
            field.ref(e);
          }}
          onKeyUp={onEnterPress}
          onFocus={() => {
            open();
          }}
        />

        <button
          type="submit"
          className={cn(
            "bg-zinc-700 rounded-md p-3 cursor-default",
            textAreaValue?.length && !isPending && "cursor-pointer",
          )}
        >
          {isPending ? (
            <RotateCw className="h-5 w-5 animate-spin stroke-muted" />
          ) : (
            <SendHorizontal
              className={cn(
                "stroke-muted h-5 w-5",
                textAreaValue?.length && "stroke-zinc-300",
              )}
            />
          )}
        </button>
      </form>
    </div>
  );
};
