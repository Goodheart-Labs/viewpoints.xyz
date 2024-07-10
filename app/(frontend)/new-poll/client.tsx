"use client";

import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";

import { CheckIcon } from "@heroicons/react/20/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import * as yup from "yup";

import BorderedButton from "@/components/BorderedButton";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import {
  Input,
  QuestionTitle,
  SubTitle,
} from "@/app/components/polls/poll-components";
import { cn } from "@/utils/style-utils";
import { Textarea } from "@/app/components/shadcn/ui/textarea";

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
  canCreatePoll: boolean;
};

// Validation
// -----------------------------------------------------------------------------
const checkSlugExists = async (slug: string) => {
  const uriEncoded = encodeURIComponent(slug);
  const res = await axios.get<{ pollExists: boolean }>(
    `/api/slug-exists?slug=${uriEncoded}`,
  );
  return res.data?.pollExists;
};
const getStatementsArrayFromString = (value: string) =>
  value.split("\n").filter((s) => s.trim() !== "");

const schema = yup
  .object({
    title: yup.string().required(),
    slug: yup.lazy(() =>
      yup
        .string()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .required("Slug is required")
        .test("check-slug", "Slug already exists", async (value) => {
          if (!value) return true;
          const exists = await checkSlugExists(value);
          return !exists;
        }),
    ),
    question: yup.string().default(""),
    statements: yup.string().test(
      "statements",
      ({ value }) => {
        if (typeof value !== "string") return "";
        return `At least ${5 - getStatementsArrayFromString(value).length} more statements required. (Use a new line for each statement)`;
      },
      (value) => {
        if (typeof value !== "string") return false;
        return getStatementsArrayFromString(value).length >= 5;
      },
    ),
    with_demographic_questions: yup.boolean().default(false),
    new_statements_visible_by_default: yup.boolean().default(true),
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
    control,
    formState: { errors, isValid },
  },
  callbacks: { onSubmit, onBlurTitle },
  canCreatePoll,
}: NewPollPageClientViewProps) => (
  <form
    className={cn("flex flex-col w-full px-4", {
      "opacity-70 cursor-not-allowed": !canCreatePoll,
    })}
  >
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <QuestionTitle>Poll Title</QuestionTitle>
        <SubTitle>Give it a catchy name</SubTitle>
        <div className="flex flex-col">
          <Input
            hasErrors={!!errors?.title}
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
        <QuestionTitle>Slug</QuestionTitle>
        <SubTitle>This will be in the URL for your poll.</SubTitle>

        <div className="flex flex-col">
          <Input hasErrors={!!errors?.slug} type="text" {...register("slug")} />
          {errors?.slug ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.slug.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <QuestionTitle>Main Question</QuestionTitle>
        <SubTitle>
          What&apos;s the key question you&apos;re trying to answer?
        </SubTitle>

        <div className="flex flex-col">
          <Input
            hasErrors={!!errors?.question}
            type="text"
            placeholder="What do you think of the following statements?"
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
        <QuestionTitle>Statements</QuestionTitle>
        <SubTitle>
          Add at least five statements that people can respond to. The more the
          better!
        </SubTitle>
        <Controller
          name="statements"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col mb-5 ">
              <Textarea className="leading-6" rows={5} {...field} />
              {errors?.statements ? (
                <span className="mt-1 text-sm text-red-500">
                  {errors.statements.message}
                </span>
              ) : null}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col w-full mt-0">
        <QuestionTitle>Demographic Questions</QuestionTitle>
        <SubTitle>
          We can ask people some demographic questions to help you understand
          the results better.
        </SubTitle>

        <p>
          <label id="with_demographic_questions">
            <input
              type="checkbox"
              className="mr-2"
              {...register("with_demographic_questions")}
            />
            <span className="text-lg text-gray-200">
              Include demographic questions?
            </span>
          </label>
        </p>
      </div>

      <div className="flex flex-col w-full mt-10">
        <QuestionTitle>New Statements</QuestionTitle>
        <SubTitle>
          Should statements added by respondents initially be visible or hidden?
        </SubTitle>

        <p>
          <label id="with_demographic_questions">
            <input
              type="checkbox"
              className="mr-2"
              {...register("new_statements_visible_by_default")}
            />
            <span className="text-lg text-gray-200">Should be visible</span>
          </label>
        </p>
      </div>

      <div className="flex items-center justify-end w-full py-4 my-10 bg-gray-50 bg-gray-950">
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

const NewPollPageClient = ({ canCreatePoll }: { canCreatePoll: boolean }) => {
  const router = useRouter();

  const form = useForm<FormData>({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      with_demographic_questions: false,
      new_statements_visible_by_default: true,
    },
    disabled: !canCreatePoll,
  });

  // Mutations

  const newPollMutation = useMutation(
    async ({
      title,
      slug,
      question,
      statements,
      with_demographic_questions,
      new_statements_visible_by_default,
    }: Omit<FormData, "statements"> & { statements: string[] }) => {
      await axios.post(`/api/polls`, {
        title,
        slug,
        question,
        statements,
        with_demographic_questions,
        new_statements_visible_by_default,
      });
    },
  );

  // Callbacks

  const { track } = useAmplitude();

  const onSubmit = async ({
    title,
    slug,
    question,
    statements,
    with_demographic_questions,
    new_statements_visible_by_default,
  }: FormData) => {
    await newPollMutation.mutateAsync({
      title,
      slug,
      question,
      statements: statements!.split("\n").filter((c) => c.trim() !== ""),
      with_demographic_questions,
      new_statements_visible_by_default,
    });

    track({
      type: "polls.create",
      slug,
    });

    router.push(`/polls/${slug}`);
  };

  // Update slug when title changes, if slug is empty

  const onBlurTitle = () => {
    if (form.formState.dirtyFields.title && !form.getValues("slug")) {
      form.setValue("slug", slugify(form.getValues("title").toLowerCase()));
      form.trigger("slug");
    }
  };

  // Render

  return (
    <NewPollPageClientView
      state={{
        loading: newPollMutation.isLoading,
      }}
      form={form}
      callbacks={{ onSubmit, onBlurTitle }}
      canCreatePoll={canCreatePoll}
    />
  );
};

export default NewPollPageClient;
