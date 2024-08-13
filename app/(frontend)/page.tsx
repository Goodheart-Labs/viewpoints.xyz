import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import type { Author } from "@/db/schema";
import { db } from "@/db/client";
import { Logo } from "@/components/Logo";
import { Button } from "../components/shadcn/ui/button";
import { WhatsappLink } from "../components/WhatsappLink";
import { Main } from "../components/Main";
import { Card, PollList } from "./PollList";

// Data
// -----------------------------------------------------------------------------

async function getData() {
  const polls = await db
    .selectFrom("polls")
    .innerJoin("statements", "polls.id", "statements.poll_id")
    .select(({ fn }) => [
      "polls.id",
      "polls.slug",
      "polls.title",
      "polls.user_id",
      // TODO: this is the full statement count, not the public statement count
      fn.count<number>("statements.id").as("statementCount"),
    ])
    .where("polls.visibility", "=", "public")
    .orderBy("polls.id", "desc")
    .groupBy("polls.id")
    .execute();

  const authors = (
    await db
      .selectFrom("authors")
      .selectAll()
      .where(
        "userId",
        "in",
        polls.map((poll) => poll.user_id),
      )
      .execute()
  ).reduce(
    (acc, author) => {
      acc[author.userId] = author;
      return acc;
    },
    {} as Record<string, Author>,
  );

  const respondents = (
    await db
      .selectFrom("responses")
      .innerJoin("statements", "responses.statementId", "statements.id")
      .select([
        "responses.user_id",
        "responses.session_id",
        "statements.poll_id",
      ])
      .groupBy("statements.poll_id")
      .groupBy("responses.user_id")
      .groupBy("responses.session_id")
      .execute()
  ).reduce(
    (acc, response) => {
      const currentRespondentCount = acc[response.poll_id] ?? 0;
      acc[response.poll_id] = currentRespondentCount + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    polls,
    authors,
    respondents,
  };
}

// Default export
// -----------------------------------------------------------------------------

const Index = async () => {
  const { polls, authors, respondents } = await getData();

  return (
    <>
      <Main className="flex flex-col items-center">
        <Card className="flex mb-8 md:space-x-4">
          <div className="w-full md:w-5/12 md:p-8">
            <h2 className="mb-4 text-3xl font-medium leading-8 md:text-white/90">
              What on earth are you thinking?
            </h2>
            <p className="mb-4 md:mb-6 text-white/90 md:text-white/80">
              Viewpoints.xyz is a tool that lets you gauge opinions on any
              topic. Create a poll, get a link, and find out what your community
              is thinking.
            </p>
            <p className="mb-2">
              <Link href="/new-poll" prefetch={false}>
                <Button
                  variant="pill"
                  size="pill"
                  className="pr-5 text-sm bg-white text-gray-800 hover:bg-white/80"
                >
                  <PlusCircle className="w-4 mr-2" />
                  Create poll
                </Button>
              </Link>
            </p>
          </div>
          <div className="flex-col justify-center hidden md:flex">
            <Image
              className="mr-8"
              src="/hero.png"
              alt="an example statement"
              width={540}
              height={40}
            />
          </div>
        </Card>

        <h3 className="w-full mb-2 text-xl font-medium text-white/90 md:text-white/80">
          Running public polls
        </h3>

        <PollList polls={polls} authors={authors} respondents={respondents} />
      </Main>

      <footer className="flex flex-col items-center w-full py-8 mt-4 md:mt-auto bg-white/10 text-white/80">
        <Link href="/" className="hover:grayscale-0 grayscale">
          <Logo width={200} height={40} />
        </Link>

        <div className="flex justify-center mt-4 space-x-5 text-xs font-medium">
          <WhatsappLink />

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

        <Link href="/privacy-policy" className="mt-4 text-xs underline">
          Privacy policy
        </Link>

        <p className="mt-4 text-xs">
          &copy; {new Date().getFullYear()} Goodheart Labs
        </p>
      </footer>
    </>
  );
};

export default Index;
