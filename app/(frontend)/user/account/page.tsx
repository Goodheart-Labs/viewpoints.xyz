import { Main } from "@/app/components/Main";
import { Button } from "@/app/components/shadcn/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { UpgradeLink } from "@/components/UpgradeLink";
import { getSubscription } from "@/lib/getSubscription";
import { currentUser } from "@clerk/nextjs/server";
import dayjs from "dayjs";
import Link from "next/link";

export default async function Account() {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;
  const { subscription } = await getSubscription();

  return (
    <Main className="grid gap-4 text-white">
      <PageTitle title="Account" />
      <p className="text-lg text-gray-300">Logged in as: {email}</p>
      {subscription ? (
        <div className="grid gap-6 p-6 border border-gray-700 rounded-xl bg-gray-800/50">
          <h2 className="text-xl font-semibold text-white">
            Subscription Details
          </h2>
          <div className="grid gap-3 text-base">
            <p className="flex justify-between">
              <span className="font-medium text-gray-300">Status:</span>
              <span className="text-white">
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-300">Billing Cycle:</span>
              <span className="text-white">
                {subscription.billingCycle.charAt(0).toUpperCase() +
                  subscription.billingCycle.slice(1)}
                ly
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-300">
                Next Billing Date:
              </span>
              <span className="text-white">
                {dayjs(subscription.nextBillingDate).format("MMMM D, YYYY")}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-300">Currency:</span>
              <span className="text-white">
                {subscription.currency.toUpperCase()}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-gray-300">
                Subscription Start Date:
              </span>
              <span className="text-white">
                {dayjs(subscription.startDate).format("MMMM D, YYYY")}
              </span>
            </p>
          </div>
          <Button className="w-full text-base font-medium" asChild>
            <Link
              href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL!}
              target="_blank"
            >
              Manage Subscription
            </Link>
          </Button>
        </div>
      ) : (
        <UpgradeLink />
      )}
    </Main>
  );
}
