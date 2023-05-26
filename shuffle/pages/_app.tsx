import AuthHeader from "@/components/AuthHeader";
import AmplitudeProvider from "@/providers/AmplitudeProvider";
import ModalProvider from "@/providers/ModalProvider";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";
import "@/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import { Tooltip } from "react-tooltip";

const App = ({ Component, pageProps }: AppProps) => (
  <SessionProvider>
    <AmplitudeProvider>
      <SupabaseProvider>
        <ClerkProvider>
          <ModalProvider>
            <QueryProvider>
              <AuthHeader />
              <Component {...pageProps} />
              <Tooltip id="tooltip" />
            </QueryProvider>
          </ModalProvider>
        </ClerkProvider>
      </SupabaseProvider>
    </AmplitudeProvider>
  </SessionProvider>
);

export default App;
