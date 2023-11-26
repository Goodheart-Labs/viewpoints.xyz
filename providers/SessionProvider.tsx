"use client";

import { AFTER_DEPLOY_COOKIE_NAME } from "@/middleware";
import axios from "axios";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCookie,
  setCookie,
  getCookies,
  removeCookie,
} from "typescript-cookie";
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

const SessionProvider = ({ children }: PropsWithChildren) => {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // We've had some problems with nextjs and clerk sessions, so we're going to
    // wipe all cookies after this deploy and start fresh.
    //
    // Why aren't we doing this in the middleware? https://github.com/clerk/javascript/issues/1897

    if (!getCookie(AFTER_DEPLOY_COOKIE_NAME)) {
      console.log("Wiping cookies and localstorage after deploy");

      const allCookies = getCookies();

      // Expire all cookies except sessionId

      Object.keys(allCookies).forEach((cookieName) => {
        if (
          cookieName !== "sessionId" &&
          cookieName !== SESSION_ID_COOKIE_NAME
        ) {
          removeCookie(cookieName);
        }
      });

      // Clear localstorage

      localStorage.clear();

      // Set a flag so we don't do this again

      setCookie(AFTER_DEPLOY_COOKIE_NAME, "true", { expires: Infinity });

      // Reload the page

      window.location.reload();
    }

    // If the user doesn't already have one, set a session ID cookie.

    let storedSessionId = getCookie(SESSION_ID_COOKIE_NAME);

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      setCookie(SESSION_ID_COOKIE_NAME, newSessionId, { expires: Infinity });
      setSessionId(newSessionId);
      storedSessionId = newSessionId;
    }

    axios.post("/api/sessions", {
      userAgent: navigator.userAgent,
    });
  }, []);

  const value = useMemo(() => ({ sessionId }), [sessionId]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionProvider;
