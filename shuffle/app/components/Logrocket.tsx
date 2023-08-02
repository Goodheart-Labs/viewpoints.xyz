"use client";

import { useEffect } from "react";

import { useUser } from "@clerk/nextjs";
import Logrocket from "logrocket";

const LogrocketWrapper = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user || !process.env.NEXT_PUBLIC_LOGROCKET_ID) return;

    Logrocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
    Logrocket.identify(user.id, {
      name: user.fullName || user.id,
      email: user.emailAddresses[0].emailAddress,
    });
  }, [isSignedIn, user]);

  return null;
};

export default LogrocketWrapper;
