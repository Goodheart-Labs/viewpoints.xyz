"use client";

import { createContext, useState } from "react";

import type { SubscriptionState } from "@/lib/getSubscription";

export const SubscriptionContext = createContext<SubscriptionState>({
  subscription: null,
});

export function SubscriptionProvider({
  children,
  initialState = { subscription: null },
}: {
  children: React.ReactNode;
  initialState?: SubscriptionState;
}) {
  const [subscription, setSubscription] =
    useState<SubscriptionState>(initialState);

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}
