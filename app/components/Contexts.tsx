"use client";

import type { PropsWithChildren } from "react";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import CurrentPollProvider from "@/providers/CurrentPollProvider";
import QueryProvider from "@/providers/QueryProvider";

const Contexts = ({ children }: PropsWithChildren) => (
  <AmplitudeProvider>
    <QueryProvider>
      <CurrentPollProvider>{children}</CurrentPollProvider>
    </QueryProvider>
  </AmplitudeProvider>
);

export default Contexts;
