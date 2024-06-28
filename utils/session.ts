import { SESSION_ID_COOKIE_NAME } from "@/middleware";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export const getSessionId = () => {
  const sessionCookie = cookies().get(SESSION_ID_COOKIE_NAME);
  return sessionCookie ? sessionCookie.value : uuidv4();
};
