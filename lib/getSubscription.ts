import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "./stripe";

/**
 * A helper function to be run on the server,
 * which gets the current user's subscription
 */
export async function getSubscription() {
  const user = await currentUser();

  if (!user) return { subscription: null };

  // Get stripe subscription with clerkId on metadata
  const subscription = (
    await stripe.subscriptions.search({
      query: `metadata['clerkId']:'${user.id}'`,
    })
  ).data[0];

  if (!subscription) return { subscription: null };

  const safeSubscription = {
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    billingCycle: subscription.items.data[0].price.recurring!.interval,
    nextBillingDate: subscription.current_period_end * 1000,
    currency: subscription.items.data[0].price.currency,
    startDate: subscription.start_date * 1000,
  };

  return {
    subscription: safeSubscription,
  };
}

export type SubscriptionState = Awaited<ReturnType<typeof getSubscription>>;
