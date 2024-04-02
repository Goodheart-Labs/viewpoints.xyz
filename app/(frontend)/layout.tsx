import type { Metadata, Viewport } from "next";
import { Toaster } from "@/app/components/shadcn/ui/toaster";
import "@/styles/tailwind.css";
import "@/styles/frontend.css";

// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "viewpoints.xyz",
  description: "what in the world are you thinking?",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Default export
// -----------------------------------------------------------------------------

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body className="flex flex-col items-stretch min-h-screen bg-black">
      {children}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;
