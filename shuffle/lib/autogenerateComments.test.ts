import { describe, expect, it } from "vitest";

import { parseResults } from "./autogenerateComments";

describe("parseResults", () => {
  it("returns undefined when it can't find the result marker", () => {
    const prompt = "foobar";
    expect(parseResults(prompt)).toBeNull();
  });

  it("returns undefined when there are not at least two instances of the result marker", () => {
    const prompt = `
PROMPT: foo
RESULT: bar

PROMPT: bar
    `;
    expect(parseResults(prompt)).toBeNull();
  });

  it("returns undefined when the final segment is empty", () => {
    const prompt = `
PROMPT: foo
RESULT: bar

PROMPT: bar
RESULT: 
    `;
    expect(parseResults(prompt)).toBeNull();
  });

  it("returns undefined when the completion isn't valid JSON", () => {
    const prompt = `
PROMPT: foo
RESULT: bar

PROMPT: bar
RESULT: something that isn't valid JSON
    `;
    expect(parseResults(prompt)).toBeNull();
  });

  it("returns undefined when the completion isn't a valid JSON array", () => {
    const prompt = `
PROMPT: foo
RESULT: bar

PROMPT: bar
RESULT: {"foo":"bar"}
    `;
    expect(parseResults(prompt)).toBeNull();
  });

  it("returns a valid JSON array", () => {
    const prompt = `
PROMPT: foo
RESULT: bar

PROMPT: bar
RESULT: ["foo","bar"]
    `;

    expect(parseResults(prompt)).toEqual(["foo", "bar"]);
  });
});
