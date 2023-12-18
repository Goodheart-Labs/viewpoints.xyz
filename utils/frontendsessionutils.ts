"use client";

import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getCookie, setCookie } from "typescript-cookie";

export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string>(
    typeof document !== "undefined"
      ? getCookie(SESSION_ID_COOKIE_NAME) ?? ""
      : "",
  );

  useEffect(() => {
    if (!document) return;

    const sessionCookie = getCookie(SESSION_ID_COOKIE_NAME);
    if (!sessionCookie) {
      const newSessionId = uuidv4();
      setCookie(SESSION_ID_COOKIE_NAME, newSessionId, { expires: Infinity });
      setSessionId(newSessionId);
    } else {
      setSessionId(sessionCookie);
    }
  }, []);

  return sessionId;
};
