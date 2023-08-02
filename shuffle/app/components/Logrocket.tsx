"use client";

import { useEffect } from "react";

import { useUser } from "@clerk/nextjs";
import Script from "next/script";

const Logrocket = () => {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;

    (window as any).LogRocket.identify("THE_USER_ID_IN_YOUR_APP", {
      name: user.fullName,
      email: user.emailAddresses[0].emailAddress,
    });
  }, [isSignedIn, user?.emailAddresses, user?.fullName]);

  return (
    <Script
      src="https://cdn.lr-ingest.com/LogRocket.min.js"
      crossOrigin="anonymous"
      onLoad={() => {
        (window as any).LogRocket &&
          (window as any).LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
      }}
    ></Script>
  );
};

export default Logrocket;
