"use client";

import type { FC } from "react";
import React, { useEffect, useRef, useState } from "react";
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

  const onValueChange = (v: string) => {
    setShowComments(v === ACCORDION_VALUE);
  };

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

  const mobileCommentContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopCommentContainerRef = useRef<HTMLDivElement | null>(null);

  const onNewComment = () => {
    mobileCommentContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    desktopCommentContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div
        className={cn(
          "xl:hidden fixed inset-0 opacity-0 transition-opacity duration-300 backdrop-blur-sm bg-background/80 cursor-pointer pointer-events-none z-[60]",
          showComments && "pointer-events-auto touch-none opacity-unset",
        )}
        onClick={close}
      />
      <div className="sticky xl:static bottom-0 w-full bg-zinc-900 flex flex-col pointer-events-auto z-[60] touch-none xl:w-1/4 xl:h-full xl:rounded-lg">
        <div className="xl:hidden">
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
                <p className="text-zinc-400">
                  <span className="font-semibold text-zinc-200">
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
                  viewportRef={mobileCommentContainerRef}
                >
                  <CommentList comments={comments} />
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <p className="hidden xl:block px-5 py-3 text-zinc-400">
          <span className="font-semibold text-zinc-200">{comments.length}</span>{" "}
          comments on this poll yet
        </p>

        <ScrollArea
          viewportRef={desktopCommentContainerRef}
          className="hidden xl:block flex-1 [&>div>div]:h-full"
        >
          <CommentList comments={comments} />
        </ScrollArea>

        <CommentForm form={form} open={open} onNewComment={onNewComment} />
      </div>
    </>
  );
};
