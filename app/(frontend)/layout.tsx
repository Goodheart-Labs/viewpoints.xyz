import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Toaster } from "@/app/components/shadcn/ui/toaster";
import SessionProvider from "@/providers/SessionProvider";
import { getBaseUrl } from "@/utils/constants";
import Contexts from "../components/Contexts";
import LogrocketWrapper from "../components/LogrocketWrapper";
import "@/styles/tailwind.css";
import "@/styles/frontend.css";

// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "viewpoints.xyz",
  description: "What in the world are you thinking?",
  metadataBase: new URL(getBaseUrl()),
  openGraph: {
    images: ["/open-graph.png"],
  },
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
  <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col items-stretch min-h-screen bg-black">
        <LogrocketWrapper>
          <SessionProvider>
            <Contexts>
              <Header />
              {children}
            </Contexts>
          </SessionProvider>
        </LogrocketWrapper>
        <Toaster />
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
