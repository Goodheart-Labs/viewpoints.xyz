import type { PropsWithChildren } from "react";

import "@/styles/tailwind.css";
import Contexts from "../components/Contexts";

export const metadata = {
  title: "viewpoints.xyz",
  description: "embedded in an iframe!",
};

const EmbedLayout = ({ children }: PropsWithChildren) => (
  <html lang="en">
    <body>
      <div className="p-4">
        <Contexts>{children}</Contexts>
      </div>
    </body>
  </html>
);

export default EmbedLayout;
