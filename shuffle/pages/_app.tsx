import ModalProvider from "@/providers/ModalProvider";
import QueryProvider from "@/providers/QueryProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <ModalProvider>
    <QueryProvider>
      <Component {...pageProps} />
    </QueryProvider>
  </ModalProvider>
);

export default App;
