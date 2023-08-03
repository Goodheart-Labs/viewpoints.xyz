"use client";

import type { FC, PropsWithChildren } from "react";
import { useEffect } from "react";

import { useUser } from "@clerk/nextjs";
import Logrocket from "logrocket";

type LogrocketWrapperProps = {
  children: React.ReactNode;
};

const LogrocketWrapper: FC<PropsWithChildren<LogrocketWrapperProps>> = ({
  children,
}) => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user || !process.env.NEXT_PUBLIC_LOGROCKET_ID) return;

    Logrocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
    Logrocket.identify(user.id, {
      name: user.fullName || user.id,
      email: user.emailAddresses[0].emailAddress,
    });
  }, [isSignedIn, user]);

  return <>{children}</>;
};

export default LogrocketWrapper;
