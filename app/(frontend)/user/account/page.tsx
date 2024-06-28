import { Main } from "@/app/components/Main";
import { Button } from "@/app/components/shadcn/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { auth } from "@clerk/nextjs";

// Fake function to determine if the user is a pro user
function isPro(user: any) {
  // Replace with actual logic to determine if the user is a pro user
  return user?.publicMetadata?.isPro || false;
}

export default async function Account() {
  const { user } = auth();
  const email = user?.emailAddresses[0].emailAddress;
  const pro = isPro(user);

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
