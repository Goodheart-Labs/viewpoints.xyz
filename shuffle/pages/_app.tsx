import ModalProvider from "@/providers/ModalProvider";
import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <SessionProvider>
    <SupabaseProvider>
      <ModalProvider>
        <QueryProvider>
          <Component {...pageProps} />
        </QueryProvider>
      </ModalProvider>
    </SupabaseProvider>
  </SessionProvider>
);

export default App;
