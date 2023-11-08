import type { PropsWithChildren } from "react";

import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/tailwind.css";
import LogrocketWrapper from "../components/LogrocketWrapper";
import Contexts from "../components/Contexts";

export const metadata = {
  title: "viewpoints.xyz",
  description: "embedded in an iframe!",
};

const EmbedLayout = ({ children }: PropsWithChildren) => (
  <ClerkProvider>
    <html lang="en">
      <body>
        <div className="p-4">
          <LogrocketWrapper>
            <Contexts>{children}</Contexts>
          </LogrocketWrapper>
        </div>
      </body>
    </html>
  </ClerkProvider>
);

export default EmbedLayout;
