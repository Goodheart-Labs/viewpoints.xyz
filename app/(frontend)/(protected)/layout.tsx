import { ClerkProvider } from "@clerk/nextjs";
import LogrocketWrapper from "@/app/components/LogrocketWrapper";
import SessionProvider from "@/providers/SessionProvider";
import Contexts from "@/app/components/Contexts";
import { Header } from "@/components/Header";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <ClerkProvider>
    <LogrocketWrapper>
      <SessionProvider>
        <Contexts>
          <Header />
          {children}
        </Contexts>
      </SessionProvider>
    </LogrocketWrapper>
  </ClerkProvider>
);

export default RootLayout;
