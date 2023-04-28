import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

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
    const storedSessionId = localStorage.getItem("sessionId");

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem("sessionID", newSessionId);
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
