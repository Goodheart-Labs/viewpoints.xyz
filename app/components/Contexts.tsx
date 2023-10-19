"use client";

import type { PropsWithChildren } from "react";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import CurrentPollProvider from "@/providers/CurrentPollProvider";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const Contexts = ({ children }: PropsWithChildren) => (
  <SessionProvider>
    <AmplitudeProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <QueryProvider>
          <CurrentPollProvider>{children}</CurrentPollProvider>
        </QueryProvider>
      </ThemeProvider>
    </AmplitudeProvider>
  </SessionProvider>
);

export default Contexts;
