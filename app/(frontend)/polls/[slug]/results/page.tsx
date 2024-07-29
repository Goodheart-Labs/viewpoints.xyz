import Head from "next/head";

import { Results } from "@/app/components/polls/responses/Results";
import Link from "next/link";
import { getPollResults } from "../../../../../lib/pollResults/getPollResults";
import { DownloadButton } from "./DownloadButton";

const AnalyticsPage = async ({ params }: { params: { slug: string } }) => {
  const initialPollResults = await getPollResults(params.slug);
  const { poll, ...statistics } = initialPollResults;

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.slug}`;

  const twitterShareUrl = `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`;

  return (
    <main className="w-full px-4 gradient sm:px-0 text-white max-w-[800px] mx-auto pb-8">
      <Head>
        <title>{poll.title}</title>
        <meta name="description" content={poll.core_question} />
        <meta property="og:title" content={poll.title} />
        <meta property="og:description" content={poll.core_question} />
        <meta property="og:url" content={twitterShareUrl} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={poll.title} />
        <meta property="twitter:description" content={poll.core_question} />
        <meta property="twitter:site" content="viewpoints.xyz" />
      </Head>

      <div className="mt-4 text-center sm:mt-20">
        <p className="mb-8">
          <Link
            href={`/polls/${poll.slug}`}
            className="text-black text-gray-200"
          >
            &larr; Back to poll
          </Link>
        </p>

        <h1 className="mb-4 text-4xl font-bold text-black text-gray-200">
          {poll.title}
        </h1>
        <div className="flex items-center gap-4 justify-center">
          <h2 className="text-gray-800 sm:text-xl text-gray-500">Results</h2>
          <DownloadButton poll={poll} {...statistics} />
        </div>
      </div>

      <div className="mt-12">
        <Results initialData={initialPollResults} />
      </div>
    </main>
  );
};

export default AnalyticsPage;
