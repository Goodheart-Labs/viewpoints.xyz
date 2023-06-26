import { Metadata } from "next";
import { Tooltip } from "react-tooltip";

import "@/styles/tailwind.css";
import "@/styles/frontend.css";
import "react-tooltip/dist/react-tooltip.css";

import Contexts from "../components/Contexts";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";
import Script from "next/script";
import Logrocket from "../components/Logrocket";

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
        <Contexts>
          <Header />
          {children}
        </Contexts>
        <Tooltip id="tooltip" />
        <Logrocket />
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
