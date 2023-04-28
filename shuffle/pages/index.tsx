import { Poll } from "@/lib/api";
import { supabase } from "@/providers/SupabaseProvider";
import Link from "next/link";

// SSR
// -----------------------------------------------------------------------------

export async function getServerSideProps() {
  const { data } = await supabase.from("polls").select("*");

  return {
    props: {
      polls: data,
    },
  };
}

// Default export
// -----------------------------------------------------------------------------

const Index = ({ polls }: { polls: Poll[] }) => (
  <main className="flex flex-col items-center w-full h-screen gradient">
    <h1 className="mt-20 mb-4 text-4xl font-bold text-black dark:text-gray-200">
      Polls
    </h1>
    <h2 className="text-xl text-gray-800 dark:text-gray-500">
      Select a poll to get started
    </h2>

    <ul className="flex flex-col items-center justify-center w-full mt-20">
      {polls.map((poll) => (
        <Link href={`/polls/${poll.polis_id}`} key={poll.id}>
          <li className="w-full px-5 py-3 mb-4 text-black border border-gray-400 rounded-lg dark:border-gray-800 hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:text-white dark:text-white">
            <h2 className="w-full text-2xl font-semibold">
              <span className="min-w-[40px] inline-block">{poll.id}.</span>{" "}
              {poll.title}
            </h2>
          </li>
        </Link>
      ))}
    </ul>
  </main>
);

export default Index;
