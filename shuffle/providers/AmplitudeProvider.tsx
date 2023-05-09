import * as amplitude from "@amplitude/analytics-browser";
import { PropsWithChildren, createContext, useContext, useEffect } from "react";
import { useSession } from "./SessionProvider";
import amplitudeConfig from "@/config/amplitude";

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

const AmplitudeProvider = ({ children }: PropsWithChildren<{}>) => {
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

  return (
    <AmplitudeContext.Provider value={{ amplitude }}>
      {children}
    </AmplitudeContext.Provider>
  );
};

export default AmplitudeProvider;
