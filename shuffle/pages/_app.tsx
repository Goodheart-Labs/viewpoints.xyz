import AuthHeader from "@/components/AuthHeader";
import AmplitudeProvider from "@/providers/AmplitudeProvider";
import ModalProvider from "@/providers/ModalProvider";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <SessionProvider>
    <AmplitudeProvider>
      <SupabaseProvider>
        <ModalProvider>
          <QueryProvider>
            <AuthHeader />
            <Component {...pageProps} />
          </QueryProvider>
        </ModalProvider>
      </SupabaseProvider>
    </AmplitudeProvider>
  </SessionProvider>
);

export default App;
