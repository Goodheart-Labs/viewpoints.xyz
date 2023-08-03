import { Tooltip } from "react-tooltip";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import Header from "@/components/Header";

import Contexts from "../components/Contexts";
import LogrocketWrapper from "../components/LogrocketWrapper";

import "@/styles/tailwind.css";
import "@/styles/frontend.css";
import "react-tooltip/dist/react-tooltip.css";

// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "viewpoints.xyz",
  description: "what in the world are you thinking?",
};

// Default export
// -----------------------------------------------------------------------------

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <ClerkProvider>
    <html lang="en">
      <body>
        <LogrocketWrapper>
          <Contexts>
            <Header />
            {children}
          </Contexts>
        </LogrocketWrapper>
        <Tooltip id="tooltip" />
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
