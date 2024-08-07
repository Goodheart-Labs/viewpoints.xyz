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
import { defaultEventTrackingAdvancedPlugin } from "@amplitude/plugin-default-event-tracking-advanced-browser";

import { useAuth } from "@clerk/nextjs";
import type { TrackingEvent } from "./types";

const defaultEventTrackingPlugin = defaultEventTrackingAdvancedPlugin();

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
  const { sessionId } = useAuth();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return;

    amplitude.add(defaultEventTrackingPlugin);

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
