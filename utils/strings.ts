export const ensureItLooksLikeAQuestion = (question: string): string => {
  const trimmed = question.trim();

  if (trimmed.endsWith("?")) {
    return trimmed;
  }

  if (
    trimmed.endsWith(".") ||
    trimmed.endsWith("!") ||
    trimmed.endsWith(",") ||
    trimmed.endsWith(";") ||
    trimmed.endsWith(":") ||
    trimmed.endsWith(")") ||
    trimmed.endsWith("]") ||
    trimmed.endsWith("}") ||
    trimmed.endsWith("'") ||
    trimmed.endsWith('"')
  ) {
    return `${trimmed.slice(0, -1)}?`;
  }

  return `${trimmed}?`;
};

export const isEmail = (email?: string | null): boolean =>
  typeof email === "string" && email.match(/^\S+@\S+\.\S+$/) !== null;
