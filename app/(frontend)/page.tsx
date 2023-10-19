import { polls_visibility_enum } from "@prisma/client";
import Link from "next/link";

import prisma from "@/lib/prisma";

// Data
// -----------------------------------------------------------------------------

async function getData() {
  const polls = await prisma.polls.findMany({
    orderBy: {
      id: "asc",
    },
    where: {
      visibility: polls_visibility_enum.public,
    },
  });

  return {
    polls,
  };
}

// Default export
// -----------------------------------------------------------------------------

const Index = async () => {
  const { polls } = await getData();

  return (
    <main className="flex flex-col items-center w-full h-screen">
      <h1 className="mt-40 mb-4 text-4xl font-bold text-black dark:text-gray-200">
        Polls
      </h1>
      <h2 className="text-xl text-gray-800 dark:text-gray-500">
        Select a poll to get started
      </h2>

      <ul className="flex flex-col items-center justify-center w-full mt-20">
        {polls.map((poll, i) => (
          <Link href={`/polls/${poll.slug}`} key={poll.id.toString()}>
            <li className="w-full px-5 py-3 mb-4 text-black border border-gray-400 rounded-lg dark:border-gray-800 hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:text-white dark:text-white">
              <h2 className="w-full text-2xl font-semibold">
                <span className="min-w-[40px] inline-block">{i + 1}.</span>{" "}
                {poll.title}
              </h2>
            </li>
          </Link>
        ))}
      </ul>
    </main>
  );
};

export default Index;
