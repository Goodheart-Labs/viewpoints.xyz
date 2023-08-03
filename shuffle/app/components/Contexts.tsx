"use client";

import type { PropsWithChildren } from "react";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import CurrentPollProvider from "@/providers/CurrentPollProvider";
import ModalProvider from "@/providers/ModalProvider";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";

const Contexts = ({ children }: PropsWithChildren) => (
  <SessionProvider>
    <AmplitudeProvider>
      <ModalProvider>
        <QueryProvider>
          <CurrentPollProvider>{children}</CurrentPollProvider>
        </QueryProvider>
      </ModalProvider>
    </AmplitudeProvider>
  </SessionProvider>
);

export default Contexts;
