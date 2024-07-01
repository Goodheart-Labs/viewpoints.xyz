import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/utils/constants";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (!user) return redirect("/sign-in");

  const email = user?.emailAddresses[0]?.emailAddress;

  const price = process.env.STRIPE_PRICE;

  if (!price) throw new Error("Missing env STRIPE_PRICE");

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price,
        quantity: 1,
      },
    ],
    customer_email: email,
    success_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/user/polls`,
    subscription_data: {
      metadata: {
        clerkId: user.id,
      },
    },
  });

  if (!session.url) throw new Error("Missing session.url");

  return redirect(session.url);
}
