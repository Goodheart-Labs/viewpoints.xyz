import Analytics from "@/components/Analytics";
import { Comment, Poll } from "@/lib/api";
import { supabase } from "@/providers/SupabaseProvider";
import { getAbsoluteUrl } from "@/utils/urlutils";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useMemo } from "react";
import { useQuery } from "react-query";

// SSR
// -----------------------------------------------------------------------------

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ polisId: string }>
) {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const { polisId } = context.params;

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .eq("polis_id", polisId);

  if (!polls || polls.length === 0) {
    return {
      notFound: true,
    };
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("poll_id", polls[0].id);

  return {
    props: {
      poll: polls[0],
      comments,
      url: `${getAbsoluteUrl(context.req)}${context.resolvedUrl}`,
    },
  };
}

// Default export
// -----------------------------------------------------------------------------

const Poll = ({
  poll,
  comments: initialData,
  url,
}: {
  poll: Poll;
  comments: Comment[];
  url: string;
}) => {
  // Sharing

  const twitterShareUrl = useMemo(
    () =>
      `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`,
    [poll.id, url]
  );

  // Supabase

  const { data: comments, refetch: refetchComments } = useQuery(
    ["comments", poll.id],
    async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("poll_id", poll.id);

      if (error) {
        throw error;
      }

      return data as Comment[];
    },
    {
      initialData,
    }
  );

  const commentIds = useMemo(
    () => (comments ?? []).map((comment) => comment.id),
    [comments]
  );

  // Render

  return (
    <main className="flex flex-col items-center w-full min-h-screen px-4 gradient sm:px-0">
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

      <div className="flex flex-col mt-10 sm:mt-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">
          Analytics
        </h2>
      </div>

      <div className="mt-12">
        <Analytics commentIds={commentIds} />
      </div>
    </main>
  );
};

export default Poll;
