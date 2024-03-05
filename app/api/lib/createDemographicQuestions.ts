import type { Transaction } from "kysely";
import type { Database, NewStatement } from "@/db/schema";

const questions: {
  question: string;
  responses: string[];
}[] = [
  {
    question: "What is your age?",
    responses: [
      "Under 18",
      "18 to 44",
      "45 to 64",
      "65 or over",
      "Prefer not to say",
    ],
  },
  {
    question: "Are you?",
    responses: ["Female", "Male", "Other", "Prefer not to say"],
  },
  {
    question: "Do you consider yourself to be disabled?",
    responses: ["Yes", "No", "Prefer not to say"],
  },
  {
    question: "Please tell us your ethnic origin",
    responses: [
      "White British",
      "Other white background",
      "Black or Minority ethnic background",
      "Prefer not to say",
    ],
  },
  {
    question: "Please tell us your sexual orientation?",
    responses: [
      "Straight or heterosexual",
      "Gay or lesbian",
      "Bisexual",
      "All other sexual orientations",
      "Prefer not to say",
    ],
  },
  {
    question:
      "Do you have caring responsibilities (other than for your own children)?",
    responses: ["Yes", "No", "Don’t know", "Prefer not to say"],
  },
  {
    question:
      "Are you currently, or have you previously served in the UK Armed Forces?",
    responses: [
      "No",
      "Yes, I am currently serving/have previously served in the regular UK armed forces",
      "Yes, I am currently serving/have previously served in the reserve UK armed forces",
      "Prefer not to say",
    ],
  },
];

export const createDemographicQuestions = async (
  tx: Transaction<Database>,
  statement: Pick<NewStatement, "poll_id" | "user_id" | "session_id">,
) => {
  for (const { question, responses } of questions) {
    // eslint-disable-next-line no-await-in-loop
    const currentQuestion = await tx
      .insertInto("statements")
      .values({
        ...statement,
        question_type: "demographic",
        answer_type: "custom_options",
        text: question,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line no-await-in-loop
    await tx
      .insertInto("statement_options")
      .values(
        responses.map((option) => ({
          statement_id: currentQuestion.id,
          option,
        })),
      )
      .execute();
  }
};
