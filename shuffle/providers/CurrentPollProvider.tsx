"use client";

import { Poll } from "@/lib/api";
import axios from "axios";
import { usePathname } from "next/navigation";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "react-query";

// Types
// -----------------------------------------------------------------------------

type CurrentPollContextValue = {
  currentPoll: Poll | undefined;
};

// Context
// -----------------------------------------------------------------------------

const CurrentPollContext = createContext<CurrentPollContextValue>({
  currentPoll: undefined,
});

// Hook
// -----------------------------------------------------------------------------

export const useCurrentPoll = () => useContext(CurrentPollContext);

// Provider
// -----------------------------------------------------------------------------

const CurrentPollProvider = ({ children }: PropsWithChildren<{}>) => {
  // State

  const [currentPoll, setCurrentPoll] = useState<Poll | undefined>();

  // Slug

  const pathname = usePathname();

  const currentPollSlug = useMemo(
    () => pathname.match(/\/polls\/([^/]+)\//)?.[1],
    [pathname]
  );

  // Fetch

  const currentPollQuery = useQuery(["polls", currentPollSlug], async () => {
    if (!currentPollSlug) return undefined;
    const { data } = await axios.get(`/api/polls/${currentPollSlug}`);
    return data as Poll;
  });

  useEffect(() => {
    if (currentPollQuery.data) {
      setCurrentPoll(currentPollQuery.data);
    } else if (!currentPollQuery.isLoading) {
      setCurrentPoll(undefined);
    }
  }, [currentPollQuery]);

  // Render

  return (
    <CurrentPollContext.Provider value={{ currentPoll }}>
      {children}
    </CurrentPollContext.Provider>
  );
};

export default CurrentPollProvider;
