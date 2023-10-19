import type { PropsWithChildren } from "react";

import "@/styles/tailwind.css";

export const metadata = {
  title: "viewpoints.xyz",
  description: "embedded in an iframe!",
};

const RootLayout = ({ children }: PropsWithChildren) => (
  <html lang="en">
    <body>
      <div className="p-4">{children}</div>
    </body>
  </html>
);

export default RootLayout;
