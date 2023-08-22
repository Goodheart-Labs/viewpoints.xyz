"use client";

import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { CheckIcon } from "@heroicons/react/20/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import * as yup from "yup";

import StatementList from "@/app/components/polls/new/StatementList";
import BorderedButton from "@/components/BorderedButton";
import { slugify } from "@/utils/stringutils";

// Types
// -----------------------------------------------------------------------------

type NewPollPageClientViewProps = {
  state: {
    loading: boolean;
  };
  form: ReturnType<typeof useForm<FormData>>;
  callbacks: {
    onSubmit: (data: FormData) => void;
    onBlurTitle: () => void;
  };
};

// Validation
// -----------------------------------------------------------------------------

const schema = yup
  .object({
    title: yup.string().required(),
    slug: yup
      .string()
      .required()
      .matches(/^[a-z0-9-]+$/),
    question: yup.string().required(),
    statements: yup.array().of(yup.string().required()).min(5).required(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

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
  callbacks: { onSubmit, onBlurTitle },
}: NewPollPageClientViewProps) => (
  <form className="flex flex-col w-full px-4">
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
              errors?.title ? "border-red-500" : "",
            )}
            autoFocus
            {...register("title", {
              onBlur: onBlurTitle,
            })}
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
              errors?.slug ? "border-red-500" : "",
            )}
            {...register("slug")}
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
              errors?.question ? "border-red-500" : "",
            )}
            {...register("question")}
          />
          {errors?.question ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.question.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <h3 className="mb-2 text-xl font-semibold">Statements</h3>
        <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
          Add at least five statements that people can respond to. The more the
          better!
        </h4>

        <Controller
          name="statements"
          control={control}
          render={({ field }) => (
            <StatementList
              data={{ title: watch("title"), question: watch("question") }}
              state={{ errors }}
              callbacks={{
                onStatementsChange: (statements) => {
                  field.onChange(statements);
                },
                onStatementsBlur: (statements) => {
                  field.onChange(statements);
                },
              }}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-end w-full py-4 my-10 bg-gray-50 dark:bg-gray-950">
        <div>
          <BorderedButton
            type="button"
            color="green"
            disabled={loading || !isValid}
            onClick={handleSubmit(onSubmit)}
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

const NewPollPageClient = () => {
  const router = useRouter();

  // State

  const form = useForm<FormData>({
    mode: "onTouched",
    resolver: yupResolver(schema),
  });

  // Mutations

  const newPollMutation = useMutation(
    async ({ title, slug, question, statements }: FormData) => {
      await axios.post(`/api/polls`, {
        title,
        slug,
        question,
        statements,
      });
    },
  );

  // Callbacks

  const onSubmit = useCallback(
    async ({ title, slug, question, statements }: FormData) => {
      await newPollMutation.mutateAsync({
        title,
        slug,
        question,
        statements: statements.filter((c) => c.trim() !== ""),
      });

      router.push(`/polls/${slug}`);
    },
    [newPollMutation, router],
  );

  // Update slug when title changes, if slug is empty

  const onBlurTitle = useCallback(() => {
    if (form.formState.dirtyFields.title && !form.getValues("slug")) {
      form.setValue("slug", slugify(form.getValues("title").toLowerCase()));
    }
  }, [form]);

  // Render

  return (
    <NewPollPageClientView
      state={{
        loading: newPollMutation.isLoading,
      }}
      form={form}
      callbacks={{ onSubmit, onBlurTitle }}
    />
  );
};

export default NewPollPageClient;
