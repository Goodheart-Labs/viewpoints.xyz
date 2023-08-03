import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";

import * as amplitude from "@amplitude/analytics-browser";

import amplitudeConfig from "@/config/amplitude";

import { useSession } from "./SessionProvider";

// Events
// -----------------------------------------------------------------------------

export enum TrackingEvent {
  Drag = "drag",
  VoteAgreement = "votes.agree",
  VoteDisagreement = "votes.disagree",
  VoteSkipped = "votes.skip",
  VoteItsComplicated = "votes.itsComplicated",
  ViewAllVotes = "votes.viewAll",
  OpenNewComment = "comments.new.open",
  PersistNewComment = "comments.new.persist",
  CancelNewComment = "comments.new.cancel",
  OpenEditComment = "comments.edit.open",
  PersistEditComment = "comments.edit.persist",
  CancelEditComment = "comments.edit.cancel",
  OpenFlagComment = "comments.flag.open",
  PersistFlagComment = "comments.flag.persist",
  CancelFlagComment = "comments.flag.cancel",
  Share = "share",
  OpenNewPoll = "polls.new.open",
}

// Types
// -----------------------------------------------------------------------------

type AmplitudeContextValue = {
  amplitude: typeof amplitude;
};

// Context
// -----------------------------------------------------------------------------

const AmplitudeContext = createContext<AmplitudeContextValue>({
  amplitude,
});

// Hook
// -----------------------------------------------------------------------------

export const useAmplitude = () => useContext(AmplitudeContext);

// Provider
// -----------------------------------------------------------------------------

const AmplitudeProvider = ({ children }: PropsWithChildren) => {
  const { sessionId } = useSession();

  useEffect(() => {
    amplitude.init(amplitudeConfig.apiKey, sessionId ?? undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: true,
      },
    });
  }, [sessionId]);

  const value = useMemo(() => ({ amplitude }), []);

  return (
    <AmplitudeContext.Provider value={value}>
      {children}
    </AmplitudeContext.Provider>
  );
};

export default AmplitudeProvider;
