import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCookie, setCookie } from "typescript-cookie";
import { v4 as uuidv4 } from "uuid";

// Config
// -----------------------------------------------------------------------------

export const SESSION_ID_COOKIE_NAME = "sessionId";

// Types
// -----------------------------------------------------------------------------

type SessionContextValue = {
  sessionId: string;
};

// Context
// -----------------------------------------------------------------------------

const SessionContext = createContext<SessionContextValue>({
  sessionId: "",
});

// Hook
// -----------------------------------------------------------------------------

export const useSession = () => useContext(SessionContext);

// Provider
// -----------------------------------------------------------------------------

const SessionProvider = ({ children }: PropsWithChildren<{}>) => {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const storedSessionId = getCookie(SESSION_ID_COOKIE_NAME);

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      setCookie(SESSION_ID_COOKIE_NAME, newSessionId, { expires: Infinity });
      setSessionId(newSessionId);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
