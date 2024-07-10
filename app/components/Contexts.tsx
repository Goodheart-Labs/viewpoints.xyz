"use client";

import type { PropsWithChildren } from "react";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import QueryProvider from "@/providers/QueryProvider";
import { PosthogProvider } from "@/providers/PosthogProvider";

const Contexts = ({ children }: PropsWithChildren) => (
  <PosthogProvider>
    <AmplitudeProvider>
      <QueryProvider>{children}</QueryProvider>
    </AmplitudeProvider>
  </PosthogProvider>
);

export default Contexts;
