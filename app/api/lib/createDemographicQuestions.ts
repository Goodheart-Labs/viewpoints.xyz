import type { Transaction } from "kysely";
import type { Database, NewStatement } from "@/db/schema";

export const createDemographicQuestions = async (
  tx: Transaction<Database>,
  statement: Pick<NewStatement, "poll_id" | "user_id" | "session_id">,
) => {
  // How old are you:
  // <18
  // 18 - 25
  // 26 - 39
  // 40 +
  // Rather not say

  const howOldAreYou = await tx
    .insertInto("statements")
    .values({
      ...statement,
      question_type: "demographic",
      answer_type: "custom_options",
      text: "How old are you?",
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  await tx
    .insertInto("statement_options")
    .values([
      {
        statement_id: howOldAreYou.id,
        option: "<18",
      },
      {
        statement_id: howOldAreYou.id,
        option: "18 - 25",
      },
      {
        statement_id: howOldAreYou.id,
        option: "26 - 39",
      },
      {
        statement_id: howOldAreYou.id,
        option: "40 +",
      },
      {
        statement_id: howOldAreYou.id,
        option: "Rather not say",
      },
    ])
    .execute();

  // Education:
  // To ~18
  // University degree
  // Postgraduate degree
  // Rather not say

  const education = await tx
    .insertInto("statements")
    .values({
      ...statement,
      question_type: "demographic",
      answer_type: "custom_options",
      text: "Education",
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  await tx
    .insertInto("statement_options")
    .values([
      {
        statement_id: education.id,
        option: "To ~18",
      },
      {
        statement_id: education.id,
        option: "University degree",
      },
      {
        statement_id: education.id,
        option: "Postgraduate degree",
      },
      {
        statement_id: education.id,
        option: "Rather not say",
      },
    ])
    .execute();

  // What is your gender:
  // Male
  // Female
  // Other
  // Rather not say

  const gender = await tx
    .insertInto("statements")
    .values({
      ...statement,
      question_type: "demographic",
      answer_type: "custom_options",
      text: "What is your gender?",
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  await tx
    .insertInto("statement_options")
    .values([
      {
        statement_id: gender.id,
        option: "Male",
      },
      {
        statement_id: gender.id,
        option: "Female",
      },
      {
        statement_id: gender.id,
        option: "Other",
      },
      {
        statement_id: gender.id,
        option: "Rather not say",
      },
    ])
    .execute();
};
