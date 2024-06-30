import { Main } from "@/app/components/Main";
import { Button } from "@/app/components/shadcn/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { currentUser } from "@clerk/nextjs/server";

// Fake function to determine if the user is a pro user
function isPro() {
  // Replace with actual logic to determine if the user is a pro user
  return false;
}

export default async function Account() {
  const user = await currentUser();
  const email = user?.emailAddresses[0].emailAddress;
  const pro = isPro();

  return (
    <Main className="grid gap-4 text-white">
      <PageTitle title="Account" />
      <p>Logged in as: {email}</p>
      {pro ? (
        <div>
          <p>You are a Pro user.</p>
          <Button>Manage Subscription</Button>
        </div>
      ) : (
        <div>
          <p>
            You are not a Pro user. Upgrade to Pro to create unlimited polls.
          </p>
        </div>
      )}
    </Main>
  );
}
