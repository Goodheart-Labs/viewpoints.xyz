"use client";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import ModalProvider from "@/providers/ModalProvider";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import { PropsWithChildren } from "react";

const Contexts = ({ children }: PropsWithChildren<{}>) => (
  <SessionProvider>
    <AmplitudeProvider>
      <ModalProvider>
        <QueryProvider>{children}</QueryProvider>
      </ModalProvider>
    </AmplitudeProvider>
  </SessionProvider>
);

export default Contexts;
