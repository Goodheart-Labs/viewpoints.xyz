// TODO: validation

"use client";

import CommentsList from "@/app/components/polls/new/CommentsList";
import BorderedButton from "@/components/BorderedButton";
import { CheckIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";

// Types
// -----------------------------------------------------------------------------

type NewPollPageClientProps = {};

type NewPollPageClientViewProps = {
  state: {
    loading: boolean;
  };
  form: ReturnType<typeof useForm<FormData>>;
  callbacks: {
    onSubmit: (data: FormData) => void;
  };
};

type Comment = string;

type FormData = {
  title: string;
  slug: string;
  question: string;
  comments: Comment[];
};

// View
// -----------------------------------------------------------------------------

const NewPollPageClientView = ({
  state: { loading },
  form: {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  },
  callbacks: { onSubmit },
}: NewPollPageClientViewProps) => (
  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full px-4">
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <h3 className="mb-2 text-xl font-semibold">Poll Title</h3>
        <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
          Give it a catchy name
        </h4>

        <div className="flex flex-col">
          <input
            type="text"
            className={clsx(
              "w-full text-lg",
              errors?.title ? "border-red-500" : ""
            )}
            autoFocus
            {...register("title", { required: "This field is required" })}
          />
          {errors?.title ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.title.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <h3 className="mb-2 text-xl font-semibold">Slug</h3>
        <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
          This will be in the URL for your poll.
        </h4>

        <div className="flex flex-col">
          <input
            type="text"
            className={clsx(
              "w-full text-lg",
              errors?.slug ? "border-red-500" : ""
            )}
            {...register("slug", { required: "This field is required" })}
          />
          {errors?.slug ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.slug.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <h3 className="mb-2 text-xl font-semibold">Main Question</h3>
        <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
          What&apos;s the key question you&apos;re trying to answer?
        </h4>

        <div className="flex flex-col">
          <input
            type="text"
            className={clsx(
              "w-full text-lg",
              errors?.question ? "border-red-500" : ""
            )}
            {...register("question", { required: "This field is required" })}
          />
          {errors?.question ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.question.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <h3 className="mb-2 text-xl font-semibold">Comments</h3>
        <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
          Add 10-20 comments that people can respond to.
        </h4>

        <Controller
          name="comments"
          control={control}
          render={({ field }) => (
            <CommentsList
              data={{ title: watch("title"), question: watch("question") }}
              callbacks={{
                onCommentsChange: (comments) => {
                  field.onChange(comments);
                },
              }}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-end w-full py-4 my-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <BorderedButton
            type="submit"
            color="green"
            disabled={loading || !isValid}
          >
            <CheckIcon className="w-5" />{" "}
            {loading ? "Saving..." : "Save and Publish Poll"}
          </BorderedButton>
        </div>
      </div>
    </div>
  </form>
);

// Default export
// -----------------------------------------------------------------------------

const NewPollPageClient = ({}: NewPollPageClientProps) => {
  const router = useRouter();

  // State

  const form = useForm<FormData>({
    mode: "onTouched",
  });

  // Mutations
  const newPollMutation = useMutation(
    async ({
      title,
      slug,
      question,
      comments,
    }: {
      title: string;
      slug: string;
      question: string;
      comments: Comment[];
    }) => {
      await axios.post(`/api/polls`, {
        title,
        slug,
        question,
        comments,
      });
    }
  );

  // Callbacks

  const onSubmit = useCallback(
    async ({ title, slug, question, comments }: FormData) => {
      await newPollMutation.mutateAsync({
        title,
        slug,
        question,
        comments: comments.filter((c) => c.trim() !== ""),
      });

      router.push(`/polls/${slug}`);
    },
    [newPollMutation, router]
  );

  // Render

  return (
    <NewPollPageClientView
      state={{
        loading: newPollMutation.isLoading,
      }}
      form={form}
      callbacks={{ onSubmit }}
    />
  );
};

export default NewPollPageClient;