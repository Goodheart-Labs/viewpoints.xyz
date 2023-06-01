// import tiktoken from "@openai/tiktoken";
// import openai from "@openai/openai";

// TODO:
//  - escape title and question
//  - add a 'get current context length' option

// Config
// -----------------------------------------------------------------------------

const MODEL_NAME = "gpt-3.5-turbo";
const CONTEXT_LENGTH = 2048; // tokens
const RESULT_MARKER = "RESULT:";

// Setup
// -----------------------------------------------------------------------------

// const tokeniser = tiktoken.getEncodingForModel(MODEL_NAME); // TODO
// const model = openai.getModel(MODEL_NAME); // TODO

// Types
// -----------------------------------------------------------------------------

type AutogenerateCommentsSettings = {
  title: string;
  question: string;
  numComments?: number;
};

type ModelSettings = {
  temperature?: number;
};

// Prompt
// -----------------------------------------------------------------------------

const PROMPT_TEXT = (title: string, question: string, n: number) => `
generateComments() is a function that takes a title, question, and N as parameters, then returns a JSON array of N comments that relate to the title and question.

The comments it generates are declarative sentences that people can agree or disagree with. For instance:

PROMPT: generateComments("AI Safety", "Do we think AI safety is important?", 5)
${RESULT_MARKER} [
    "The benefits of AI will be distributed evenly across the whole world",
    "I am concerned about AI risk",
    "We should invest more in research into how to get AIs to do what we want in line with human values",
    "AI is a technical problem to solve, not a moral or social problem",
    "I am excited about AI benefits"
]

PROMPT: generateComments("${title}", "${question}", ${n})
${RESULT_MARKER} 
`;

// Default export
// -----------------------------------------------------------------------------

const autogenerateComments = async (
  { title, question, numComments = 5 }: AutogenerateCommentsSettings,
  { temperature = 0.7 }: ModelSettings = { temperature: 0.7 }
): Promise<string[]> => {
  const fullPrompt = PROMPT_TEXT(title, question, numComments);

  const fullPromptTokenLength = checkTokenLength(fullPrompt);
  if (fullPromptTokenLength > CONTEXT_LENGTH) {
    throw new PromptTooLongError(fullPromptTokenLength, CONTEXT_LENGTH);
  }

  // TODO
  //   const completion = await model.prompt(fullPrompt, {
  //     temperature,
  //   });

  const completion =
    fullPrompt.trimEnd() +
    " " +
    JSON.stringify([
      "The benefits of AI will be distributed evenly across the whole world",
      "I am concerned about AI risk",
      "We should invest more in research into how to get AIs to do what we want in line with human values",
      "AI is a technical problem to solve, not a moral or social problem",
      "I am excited about AI benefits",
    ]);

  const results = parseResults(completion);
  if (!results || results.length !== numComments) {
    throw new CantFindResponseError(completion);
  }

  return new Promise((res) => {
    setTimeout(() => res(results), 2000);
  }); // TODO

  //   return results;
};

export default autogenerateComments;

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

  return (memoisedTokenLengths[prompt] = prompt.length); // TODO
  //   return (memoisedTokenLengths[prompt] = tokeniser.tokenize(prompt).length);
};

export const parseResults = (fullResponse: string) => {
  if (!fullResponse.includes(RESULT_MARKER)) {
    return;
  }

  const parts = fullResponse.split(RESULT_MARKER);
  if (parts.length <= 2) {
    return;
  }

  const lastPart = parts[parts.length - 1];
  if (!lastPart || lastPart.trim() === "") {
    return;
  }

  try {
    const parsedLastPart = JSON.parse(lastPart);
    if (!parsedLastPart || !Array.isArray(parsedLastPart)) {
      return;
    }

    return parsedLastPart as string[];
  } catch {
    return;
  }
};
