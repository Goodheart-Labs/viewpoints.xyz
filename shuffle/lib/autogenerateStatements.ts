// eslint-disable-next-line max-classes-per-file
import * as tiktoken from "js-tiktoken";

import { openai } from "./openai";

// TODO:
//  - add a 'get current context length' option

// Config
// -----------------------------------------------------------------------------

const MODEL_NAME = "text-davinci-003";
const CONTEXT_LENGTH = 4096; // tokens
const RESULT_MARKER = "RESULT:";

// Setup
// -----------------------------------------------------------------------------

const tokeniser = tiktoken.encodingForModel(MODEL_NAME);

// Types
// -----------------------------------------------------------------------------

type AutogenerateStatementsSettings = {
  title: string;
  question: string;
  numStatements?: number;
};

type ModelSettings = {
  temperature?: number;
};

// Prompt
// -----------------------------------------------------------------------------

const PROMPT_TEXT = (
  title: string,
  question: string,
  n: number,
  result: string = "",
) => `
generateStatements() is a function that takes a title, question, and N as parameters, then returns a JSON array of N statements that relate to the title and question.

The statements it generates are declarative sentences that people can agree or disagree with. For instance:

PROMPT: generateStatements("AI Safety", "Do we think AI safety is important?", 5)
${RESULT_MARKER} [
    "The benefits of AI will be distributed evenly across the whole world",
    "I am concerned about AI risk",
    "We should invest more in research into how to get AIs to do what we want in line with human values",
    "AI is a technical problem to solve, not a moral or social problem",
    "I am excited about AI benefits"
]

PROMPT: generateStatements(${JSON.stringify(title)}, ${JSON.stringify(
  question,
)}, ${n})
${RESULT_MARKER}${result}
`;

// Default export
// -----------------------------------------------------------------------------

const autogenerateStatements = async (
  { title, question, numStatements = 10 }: AutogenerateStatementsSettings,
  { temperature = 0.7 }: ModelSettings = { temperature: 0.7 },
): Promise<string[]> => {
  const fullPrompt = PROMPT_TEXT(title, question, numStatements);

  const fullPromptTokenLength = checkTokenLength(fullPrompt);
  if (fullPromptTokenLength > CONTEXT_LENGTH) {
    throw new PromptTooLongError(fullPromptTokenLength, CONTEXT_LENGTH);
  }

  const remainingTokens = CONTEXT_LENGTH - fullPromptTokenLength;

  const response = await openai.createCompletion({
    model: MODEL_NAME,
    prompt: fullPrompt,
    max_tokens: remainingTokens,
    temperature,
  });

  const completion = response.data.choices[0].text;
  if (!completion) {
    throw new Error(
      `Invalid response from OpenAI: ${JSON.stringify(response.data)}`,
    );
  }

  const results = parseResults(
    PROMPT_TEXT(title, question, numStatements, completion),
  );

  if (!results || results.length !== numStatements) {
    throw new CantFindResponseError(completion);
  }

  return results;
};

export default autogenerateStatements;

// Errors
// -----------------------------------------------------------------------------

class PromptTooLongError extends Error {
  actualLength: number = 0;

  maxLength: number = CONTEXT_LENGTH;

  constructor(actualLength: number, maxLength: number) {
    super();
    this.actualLength = actualLength;
    this.maxLength = maxLength;
    this.message = `Prompt too long! Token length is ${actualLength}, max is ${maxLength}`;
  }
}

class CantFindResponseError extends Error {
  fullText: string = "";

  constructor(fullText: string) {
    super();
    this.fullText = fullText;
  }
}

// Utils
// -----------------------------------------------------------------------------

const memoisedTokenLengths: Record<string, number> = {};

const checkTokenLength = (prompt: string) => {
  if (prompt in memoisedTokenLengths) {
    return memoisedTokenLengths[prompt];
  }

  const { length } = tokeniser.encode(prompt);

  memoisedTokenLengths[prompt] = length;

  return length;
};

export const parseResults = (fullResponse: string): string[] | null => {
  if (!fullResponse.includes(RESULT_MARKER)) {
    return null;
  }

  const parts = fullResponse.split(RESULT_MARKER);
  if (parts.length <= 2) {
    return null;
  }

  const lastPart = parts[parts.length - 1];
  if (!lastPart || lastPart.trim() === "") {
    return null;
  }

  try {
    const parsedLastPart = JSON.parse(lastPart);
    if (!parsedLastPart || !Array.isArray(parsedLastPart)) {
      return null;
    }

    return parsedLastPart as string[];
  } catch {
    return null;
  }
};
