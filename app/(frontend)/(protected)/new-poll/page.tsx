import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import NewPollPageClient from "./client";

// View
// -----------------------------------------------------------------------------

const NewPollPageView = () => {
  const { userId } = auth();
  if (!userId) notFound();

  return (
    <main className="flex flex-col items-center w-full max-w-5xl min-h-screen px-4 mx-auto bg-black sm:px-0">
      <div className="flex flex-col mt-10 sm:mt-40 mb-10 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold dark:text-gray-200">
          Create New Poll
        </h1>
      </div>

      <NewPollPageClient />
    </main>
  );
};

// Default export
// -----------------------------------------------------------------------------

const NewPollPage = async () => <NewPollPageView />;

export default NewPollPage;
