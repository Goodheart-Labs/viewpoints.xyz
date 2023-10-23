import type { PropsWithChildren } from "react";
import { polls_visibility_enum } from "@prisma/client";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PlusCircle } from "lucide-react";
import { cn } from "@/utils/style-utils";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { Button } from "../components/shadcn/ui/button";
import { anonymousAvatar } from "../components/user/UserAvatar";

// Data
// -----------------------------------------------------------------------------

async function getData() {
  const polls = await prisma.polls.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      user_id: true,
      _count: {
        select: {
          statements: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
    where: {
      visibility: polls_visibility_enum.public,
    },
  });

  const authors = (
    await prisma.author.findMany({
      select: {
        userId: true,
        name: true,
        avatarUrl: true,
      },
      where: {
        userId: {
          in: polls.map((poll) => poll.user_id),
        },
      },
    })
  ).reduce(
    (acc, author) => {
      acc[author.userId] = author;
      return acc;
    },
    {} as Record<
      string,
      { userId: string; name: string | null; avatarUrl: string | null }
    >,
  );

  // const responses = await prisma.$queryRaw<[{ count: string }]>(
  //   Prisma.sql`
  //   SELECT "Statement"."poll_id", COUNT("responses".*) FROM "responses"
  //     JOIN "Statement" ON "responses"."statementId" = "Statement"."id"
  //     WHERE "Statement"."poll_id" IN (${polls.map((poll) => poll.id)})
  //     GROUP BY "Statement"."poll_id"
  //     `,
  // );

  return {
    polls,
    authors,
  };
}

// Default export
// -----------------------------------------------------------------------------

const Card = ({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) => (
  <div
    className={cn(
      "w-full p-4 rounded-xl dark:bg-white/10 dark:text-white",
      className,
    )}
  >
    {children}
  </div>
);

const Index = async () => {
  const { polls, authors } = await getData();

  return (
    <>
      <main className="flex flex-col items-center w-full p-4">
        <Card className="mb-8">
          <h2 className="mb-4 text-3xl font-medium leading-8">
            What on earth are you thinking?
          </h2>
          <p className="mb-4 dark:text-white/90">
            Viewpoints.xyz is a tool that lets you gauge opinions on any topic.
            Create a poll, get a link, and find out what your community is
            thinking.
          </p>
          <p className="mb-2">
            <Link href="/polls/new">
              <Button
                variant="pill"
                size="pill"
                className="pr-5 text-sm dark:bg-white dark:text-gray-800"
              >
                <PlusCircle className="w-4 mr-2" />
                Create poll
              </Button>
            </Link>
          </p>
        </Card>

        <h3 className="w-full mb-2 text-xl font-medium dark:text-white/90">
          Running public polls
        </h3>

        {polls.length > 0 ? (
          polls.map((poll) => (
            <Card key={poll.id} className="w-full mb-4 group">
              <h4 className="mb-2 text-lg font-medium leading-6">
                {poll.title}
              </h4>
              <p className="mb-3 text-sm dark:text-white/60">
                {poll._count.statements} statements | 0 responses
              </p>

              <p className="flex items-center text-xs dark:text-white/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={authors[poll.user_id]?.avatarUrl ?? anonymousAvatar}
                  alt={authors[poll.user_id]?.name ?? "Anonymous"}
                  className="w-6 h-6 mr-2 rounded-full grayscale group-hover:grayscale-0"
                />
                <span>{authors[poll.user_id]?.name ?? "Anonymous"}</span>
              </p>
            </Card>
          ))
        ) : (
          <p className="mt-4 dark:text-white/70">
            There are no public polls at the moment. Why not{" "}
            <Link href="/polls/new" className="underline">
              create one
            </Link>
            ?
          </p>
        )}

        <Card className="my-4 dark:bg-white">
          <h3 className="mb-2 text-xl font-medium leading-8 dark:text-gray-800">
            Create your own poll!
          </h3>
          <p className="mb-4 dark:text-gray-800/90">
            It only takes a few minutes to create a poll, and you can create
            public or private polls.
          </p>
          <p className="mb-2">
            <Link href="/polls/new">
              <Button
                variant="pill"
                size="pill"
                className="pr-5 text-sm dark:bg-background dark:text-white"
              >
                <PlusCircle className="w-4 mr-2" />
                Create poll
              </Button>
            </Link>
          </p>
        </Card>
      </main>

      <footer className="flex flex-col items-center w-full py-8 mt-4 dark:bg-white/10 dark:text-white/80">
        <Link href="/" className="hover:opacity-50 grayscale">
          <div className="dark:hidden">
            <Image
              className="max-w-[160px] sm:max-w-none"
              src="/logo.png"
              alt="viewpoints.xyz"
              width={200}
              height={40}
            />
          </div>
          <div className="hidden dark:block">
            <Image
              className="max-w-[160px] sm:max-w-none"
              src="/logo-dark.png"
              alt="viewpoints.xyz"
              width={200}
              height={40}
            />
          </div>
        </Link>

        <div className="flex justify-center mt-4 space-x-5 text-xs font-medium">
          <Link
            href="https://github.com/Goodheart-Labs/viewpoints.xyz"
            target="_blank"
            className="flex items-center"
          >
            <GitHubLogoIcon className="w-4 h-4 mr-2" />
            Github
          </Link>

          <Link
            href="https://twitter.com/nathanpmyoung"
            target="_blank"
            className="flex items-center"
          >
            <TwitterLogoIcon className="w-4 h-4 mr-2" />
            Nathan&apos;s Twitter
          </Link>
        </div>

        <p className="mt-4 text-xs">
          &copy; {new Date().getFullYear()} Goodheart Labs
        </p>
      </footer>
    </>
  );
};

export default Index;
