"use client";

import type { PropsWithChildren } from "react";

import AmplitudeProvider from "@/providers/AmplitudeProvider";
import QueryProvider from "@/providers/QueryProvider";

const Contexts = ({ children }: PropsWithChildren) => (
  <AmplitudeProvider>
    <QueryProvider>{children}</QueryProvider>
  </AmplitudeProvider>
);

export default Contexts;
