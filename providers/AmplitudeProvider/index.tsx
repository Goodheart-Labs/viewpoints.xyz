import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as amplitude from "@amplitude/analytics-browser";

import { useSession } from "../SessionProvider";

import type { TrackingEvent } from "./types";

type AmplitudeContextValue = {
  track: (event: TrackingEvent) => void;
};

const AmplitudeContext = createContext<AmplitudeContextValue | null>(null);

export const useAmplitude = () => {
  const context = useContext(AmplitudeContext);
  if (!context) {
    throw new Error("useAmplitude must be used within a AmplitudeProvider");
  }
  return context;
};

const AmplitudeProvider = ({ children }: PropsWithChildren) => {
  const { sessionId } = useSession();

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return;

    amplitude.init(
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
      sessionId ?? undefined,
      {
        defaultTracking: {
          sessions: true,
          pageViews: true,
          formInteractions: true,
          fileDownloads: true,
        },
      },
    );

    setEnabled(true);
  }, [sessionId]);

  const track = useCallback(
    (event: TrackingEvent) => {
      if (!enabled) return;

      amplitude.track(event.type, event);
    },
    [enabled],
  );

  const value = useMemo(() => ({ track }), [track]);

  return (
    <AmplitudeContext.Provider value={value}>
      {children}
    </AmplitudeContext.Provider>
  );
};

export default AmplitudeProvider;
