"use client";

import { Controller, useForm, useFormState } from "react-hook-form";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/shadcn/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn/ui/select";
import { Switch } from "@/app/components/shadcn/ui/switch";
import { Label } from "@/app/components/shadcn/ui/label";

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
      ({ value }) =>
        `At least ${5 - getStatementsArrayFromString(value).length} more statements required. (Use a new line for each statement)`,
      (value) => getStatementsArrayFromString(value!).length >= 5,
    ),
    with_demographic_questions: yup.boolean().default(false),
    new_statements_visible_by_default: yup.boolean().default(true),
    poll_type: yup
      .string()
      .oneOf(["public", "private", "closed"])
      .default("public"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

// View
// -----------------------------------------------------------------------------

const NewPollPageClientView = ({
  state: { loading },
  form: {
    watch,
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
          Use a new line for each statement. Add at least five statements that
          people can respond to. The more the better!
        </SubTitle>
        <Controller
          name="statements"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col mb-5 ">
              <Textarea className="leading-6" rows={5} {...field} />
              {errors?.statements ? (
                <span className="mt-1 text-sm text-orange-500">
                  {errors.statements.message}
                </span>
              ) : null}
            </div>
          )}
        />
      </div>

      <Accordion
        defaultValue="advanced-settings"
        type="single"
        collapsible
        className="w-full mt-10"
      >
        <AccordionItem value="advanced-settings" className="border-b-0">
          <AccordionTrigger className="text-xl bg-zinc-900 px-6">
            Advanced Settings
          </AccordionTrigger>
          <AccordionContent className="bg-zinc-950 px-6 border border-zinc-900">
            <div className="flex flex-col w-full mt-4">
              <QuestionTitle>Slug</QuestionTitle>
              <SubTitle>This will be in the URL for your poll.</SubTitle>

              <div className="flex flex-col">
                <Input
                  hasErrors={!!errors?.slug}
                  type="text"
                  {...register("slug")}
                />
                {errors?.slug ? (
                  <span className="mt-1 text-sm text-red-500">
                    {errors.slug.message}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col w-full mt-8">
              <QuestionTitle>Poll Type</QuestionTitle>
              <SubTitle>Choose the visibility of your poll</SubTitle>
              <Controller
                name="poll_type"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col space-y-3">
                    {["public", "private", "closed"].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          {...field}
                          value={type}
                          checked={field.value === type}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "w-5 h-5 border rounded-full mr-3 flex items-center justify-center",
                            field.value === type
                              ? "border-white"
                              : "border-gray-400",
                          )}
                        >
                          {field.value === type && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-lg text-gray-200 capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors?.poll_type ? (
                <span className="mt-1 text-sm text-red-500">
                  {errors.poll_type.message}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col w-full mt-8">
              <QuestionTitle>New Statements</QuestionTitle>
              <SubTitle>
                Should statements added by respondents initially be visible or
                hidden?
              </SubTitle>

              <div className="flex items-center space-x-2">
                <Controller
                  name="new_statements_visible_by_default"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="new_statements_visible_by_default">
                  Should be visible
                </Label>
              </div>
            </div>

            <div className="flex flex-col w-full mt-8">
              <QuestionTitle>Demographic Questions</QuestionTitle>
              <SubTitle>
                We can ask people some demographic questions to help you
                understand the results better.
              </SubTitle>

              <div className="flex items-center space-x-2">
                <Controller
                  name="with_demographic_questions"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="with_demographic_questions">
                  Include demographic questions?
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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

const NewPollPageClient = ({
  canCreatePoll,
  revalidateUserPolls,
}: {
  canCreatePoll: boolean;
  revalidateUserPolls: () => Promise<void>;
}) => {
  const router = useRouter();

  const form = useForm<FormData>({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      statements: "",
      with_demographic_questions: false,
      new_statements_visible_by_default: true,
      poll_type: "public",
    },
    disabled: !canCreatePoll,
  });
  const formState = useFormState({ control: form.control });

  // Mutations

  const newPollMutation = useMutation(
    async ({
      title,
      slug,
      question,
      statements,
      with_demographic_questions,
      new_statements_visible_by_default,
      poll_type,
    }: Omit<FormData, "statements"> & { statements: string[] }) => {
      await axios.post(`/api/polls`, {
        title,
        slug,
        question,
        statements,
        with_demographic_questions,
        new_statements_visible_by_default,
        poll_type,
      });
      await revalidateUserPolls();
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
    poll_type,
  }: FormData) => {
    await newPollMutation.mutateAsync({
      title,
      slug,
      question,
      statements: statements!.split("\n").filter((c) => c.trim() !== ""),
      with_demographic_questions,
      new_statements_visible_by_default,
      poll_type,
    });

    track({
      type: "polls.create",
      slug,
    });

    router.push(`/polls/${slug}`);
  };

  // Update slug when title changes, if slug is empty
  const onBlurTitle = () => {
    if (formState.dirtyFields.title) {
      form.setValue("slug", slugify(form.getValues("title").toLowerCase()), {
        shouldValidate: true,
        shouldTouch: true,
      });
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
