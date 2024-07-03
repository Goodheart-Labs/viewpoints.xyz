import { getSubscription } from "./getSubscription";

export async function isUserPro() {
  const { subscription } = await getSubscription();
  return subscription ? subscription.status === "active" : false;
}

export const MAX_POLLS = 3;
