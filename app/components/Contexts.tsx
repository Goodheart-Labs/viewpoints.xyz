"use client";

import type { PropsWithChildren } from "react";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import QueryProvider from "@/providers/QueryProvider";
import { PosthogProvider } from "@/providers/PosthogProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Contexts = ({ children }: PropsWithChildren) => (
  <PosthogProvider>
    <AmplitudeProvider>
      <QueryClientProvider client={queryClient}>
        <QueryProvider>{children}</QueryProvider>
      </QueryClientProvider>
    </AmplitudeProvider>
  </PosthogProvider>
);

export default Contexts;
