import NewPollPageClient from "./client";

// View
// -----------------------------------------------------------------------------

const NewPollPageView = () => (
  <main className="flex flex-col items-center w-full max-w-5xl min-h-screen px-4 mx-auto gradient sm:px-0">
    <div className="flex flex-col mt-10 sm:mt-40 mb-10 text-center max-w-[800px]">
      <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
        Create New Poll
      </h1>
    </div>

    <NewPollPageClient />
  </main>
);

// Default export
// -----------------------------------------------------------------------------

const NewPollPage = async () => <NewPollPageView />;

export default NewPollPage;
