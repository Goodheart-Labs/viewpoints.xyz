import { Metadata } from "next";
import { Tooltip } from "react-tooltip";

import "@/styles/tailwind.css";
import "@/styles/frontend.css";
import "react-tooltip/dist/react-tooltip.css";

import Contexts from "../components/Contexts";
import AuthHeader from "@/components/AuthHeader";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "viewpoints.xyz",
  description: "what in the world are you thinking?",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <ClerkProvider>
    <html lang="en">
      <body>
        <Contexts>
          <AuthHeader />
          {children}
        </Contexts>
        <Tooltip id="tooltip" />
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
