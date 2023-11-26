import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import { Header } from "@/components/Header";
import { Toaster } from "@/app/components/shadcn/ui/toaster";

import Contexts from "../components/Contexts";
import LogrocketWrapper from "../components/LogrocketWrapper";

import { Tooltips } from "./tooltip";

import "@/styles/tailwind.css";
import "@/styles/frontend.css";
import "react-tooltip/dist/react-tooltip.css";

// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "viewpoints.xyz",
  description: "what in the world are you thinking?",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

// Default export
// -----------------------------------------------------------------------------

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col items-stretch min-h-screen bg-black">
        <LogrocketWrapper>
          <Contexts>
            <Header />
            {children}
          </Contexts>
        </LogrocketWrapper>
        <Tooltips />
        <Toaster />
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
