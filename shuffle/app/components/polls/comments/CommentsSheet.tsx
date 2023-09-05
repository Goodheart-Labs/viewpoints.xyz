import type { FC } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useBoolean } from "usehooks-ts";

import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import type { CommentWithAuthor } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shadcn/accordion";
import { ScrollArea } from "@/shadcn/scroll-area";
import { cn } from "@/utils/style-utils";

import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

const ACCORDION_VALUE = "comments";

type Props = {
  comments: CommentWithAuthor[];
};

export const CommentsSheet: FC<Props> = ({ comments }) => {
  const form = useForm<CommentForm>();

  const {
    value: showComments,
    setTrue: open,
    setFalse: close,
    setValue: setShowComments,
  } = useBoolean(false);

  const onValueChange = useCallback(
    (v: string) => {
      setShowComments(v === ACCORDION_VALUE);
    },
    [setShowComments],
  );

  const [currentViewportHeight, setCurrentViewportHeight] = useState(0);

  const initialViewportHeight = useRef<number>(0);

  useScrollRestoration(showComments);

  useEffect(() => {
    initialViewportHeight.current = window.visualViewport?.height ?? 0;
    setCurrentViewportHeight(window.visualViewport?.height ?? 0);

    const handleResize = () => {
      setCurrentViewportHeight(window.visualViewport?.height ?? 0);
    };

    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!showComments) {
      form.reset();
    }
  }, [form, showComments]);

  const isKeyboardOpen = currentViewportHeight < initialViewportHeight.current;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 opacity-0 transition-opacity duration-300 backdrop-blur-sm bg-background/80 cursor-pointer pointer-events-none z-40",
          showComments && "pointer-events-auto touch-none opacity-unset",
        )}
        onClick={close}
      />
      <div className="sticky bottom-0 w-full bg-background flex flex-col pointer-events-auto z-50 touch-none">
        <Accordion
          type="single"
          collapsible
          value={showComments ? ACCORDION_VALUE : ""}
          onValueChange={onValueChange}
          className="transition-maxH duration-500"
          style={{
            maxHeight: isKeyboardOpen ? `${currentViewportHeight}px` : "80vh",
          }}
        >
          <AccordionItem value={ACCORDION_VALUE} className="border-accent">
            <AccordionTrigger className="px-5 py-3">
              <p className="text-muted">
                <span className="font-semibold text-accent-foreground">
                  {comments.length}
                </span>{" "}
                comments on this poll yet
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea
                className="h-[40vh] max-h-[60%] [&>div>div]:h-full"
                style={{
                  height: isKeyboardOpen
                    ? `${currentViewportHeight * 0.3}px`
                    : undefined,
                }}
              >
                <CommentList comments={comments} />
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <CommentForm form={form} open={open} />
      </div>
    </>
  );
};
