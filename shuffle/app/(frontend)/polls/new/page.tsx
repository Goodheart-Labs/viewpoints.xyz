import NewPollPageClient from "./client";

// Types
// -----------------------------------------------------------------------------

type NewPollPageProps = {
  params: {};
};

type NewPollPageViewProps = {};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: NewPollPageProps) {
  return {};
}

// View
// -----------------------------------------------------------------------------

const NewPollPageView = ({}: NewPollPageViewProps) => (
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

const NewPollPage = async ({ params }: NewPollPageProps) => {
  const {} = await getData({ params });

  return <NewPollPageView />;
};

export default NewPollPage;
