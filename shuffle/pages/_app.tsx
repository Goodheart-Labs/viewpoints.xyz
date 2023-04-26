import QueryProvider from "@/providers/QueryProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <QueryProvider>
    <Component {...pageProps} />
  </QueryProvider>
);

export default App;
