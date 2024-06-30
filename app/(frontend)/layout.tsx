import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Toaster } from "@/app/components/shadcn/ui/toaster";
import { getBaseUrl } from "@/utils/constants";
import { HeaderView } from "@/components/HeaderView";
import Contexts from "../components/Contexts";
import LogrocketWrapper from "../components/LogrocketWrapper";
import "@/styles/tailwind.css";
import "@/styles/frontend.css";
import { TrackVisitor } from "../components/TrackVisitor";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <LogrocketWrapper>
        <Contexts>
          <html lang="en">
            <body className="flex flex-col items-stretch min-h-screen bg-black">
              <HeaderView />
              {children}
              <Toaster />
              <TrackVisitor />
            </body>
          </html>
        </Contexts>
      </LogrocketWrapper>
    </ClerkProvider>
  );
}
