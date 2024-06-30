import { cookies, headers } from "next/headers";
import { TrackVisitorClient } from "./TrackVisitorClient";

/**
 * A server component which sets the visitor id on future requests
 */
export function TrackVisitor() {
  const visitorId = headers().get("x-visitor-id");

  async function setVisitorId() {
    "use server";

    if (typeof visitorId === "string") {
      cookies().set("__visitor_id", visitorId);
    }
  }
  return <TrackVisitorClient setVisitorId={setVisitorId} />;
}
