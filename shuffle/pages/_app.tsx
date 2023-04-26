import UrqlProvider from "@/providers/UrqlProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => (
  <UrqlProvider>
    <Component {...pageProps} />
  </UrqlProvider>
);

export default App;
