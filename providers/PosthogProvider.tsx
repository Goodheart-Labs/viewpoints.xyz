"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      });
      setIsReady(true);
    }
  }, []);
  if (!isReady) return <>{children}</>;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
