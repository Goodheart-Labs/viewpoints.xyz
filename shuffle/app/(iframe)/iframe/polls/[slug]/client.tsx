"use client";

import type { StatementWithAuthor } from "@/lib/api";
import QueryProvider from "@/providers/QueryProvider";

type PollIframeClientProps = {
  filteredStatements: StatementWithAuthor[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PollIframeClient = ({ filteredStatements }: PollIframeClientProps) => (
  <QueryProvider>TODO</QueryProvider>
);

export default PollIframeClient;
