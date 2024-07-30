import type { Metadata, Viewport } from "next";
import { Toaster } from "@/app/components/shadcn/ui/toaster";
import { getBaseUrl } from "@/utils/constants";
import { HeaderView } from "@/components/HeaderView";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import { getSubscription } from "@/lib/getSubscription";
import PosthogPageView from "@/components/PosthogPageView";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionProvider initialState={await getSubscription()}>
      <LogrocketWrapper>
        <Contexts>
          <html lang="en">
            <body className="flex flex-col items-stretch min-h-screen bg-black">
              <HeaderView />
              {children}
              <Toaster />
              <PosthogPageView />
            </body>
          </html>
        </Contexts>
      </LogrocketWrapper>
    </SubscriptionProvider>
  );
}
