"use client";

import { useEffect, useState } from "react";

export function TrackVisitorClient({
  setVisitorId,
}: {
  setVisitorId: () => void;
}) {
  const [once, setOnce] = useState(false);
  useEffect(() => {
    if (once) return;
    setVisitorId();
    setOnce(true);
  }, [setVisitorId, once]);

  return null;
}
