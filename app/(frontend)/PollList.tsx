"use client";
import Link from "next/link";
import { Button } from "../components/shadcn/ui/button";
import { PlusCircle } from "lucide-react";
import { isEmail } from "@/utils/strings";
import { anonymousAvatar } from "../components/user/UserAvatar";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/utils/style-utils";

export function PollList({
  polls,
  authors,
  respondents,
}: {
  polls: {
    id: number;
    slug: string | null;
    title: string;
    user_id: string;
    statementCount: number;
  }[];
  authors: Record<
    string,
    {
      id: number;
      avatarUrl: string | null;
      name: string | null;
      createdAt: Date;
      userId: string;
    }
  >;
  respondents: Record<number, number>;
}) {
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div className="w-full md:flex md:flex-wrap md:-mx-2">
        <div className="md:w-1/3 md:pl-2">
          <Card className="flex flex-col bg-white md:h-[180px] md:mt-0">
            <div>
              <h3 className="mb-2 text-lg font-medium leading-6 text-gray-800">
                Create your own poll!
              </h3>
              <p className="mb-4 text-gray-800/90 md:text-sm">
                It only takes a few minutes to create a poll, and you can create
                public or private polls.
              </p>
            </div>
            <p className="mt-auto">
              <Link href="/new-poll" prefetch={false}>
                <Button
                  variant="pill"
                  size="pill"
                  className="pr-5 text-sm bg-background text-white hover:bg-orange-500"
                >
                  <PlusCircle className="w-4 mr-2" />
                  Create poll
                </Button>
              </Link>
            </p>
          </Card>
        </div>
        {polls.length > 0 ? (
          polls.slice(0, showAll ? polls.length : 11).map((poll) => {
            const numRespondents = respondents[poll.id] ?? 0;

            return (
              <Link
                className="w-full pl-2 md:w-1/3"
                href={`/polls/${poll.slug}`}
                key={poll.id}
                prefetch={false}
              >
                <Card className="w-full md:mb-2 group md:h-[180px] md:flex md:flex-col md:hover:opacity-90 md:cursor-pointer md:transition-opacity">
                  <h4 className="mb-2 text-lg font-medium leading-6">
                    {poll.title}
                  </h4>
                  <p className="mb-3 text-sm text-white/60">
                    {poll.statementCount} statements | {numRespondents}{" "}
                    {numRespondents === 1 ? "respondent" : "respondents"}
                  </p>

                  <p className="flex items-center text-xs text-white/60 md:mt-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={authors[poll.user_id]?.avatarUrl ?? anonymousAvatar}
                      alt={
                        !isEmail(authors[poll.user_id]?.name)
                          ? (authors[poll.user_id].name ?? "Anonymous")
                          : "Anonymous"
                      }
                      className="w-6 h-6 mr-2 rounded-full grayscale group-hover:grayscale-0"
                    />
                    <span>
                      {!isEmail(authors[poll.user_id]?.name)
                        ? (authors[poll.user_id].name ?? "Anonymous")
                        : "Anonymous"}
                    </span>
                  </p>
                </Card>
              </Link>
            );
          })
        ) : (
          <p className="mt-4 text-white/70">
            There are no public polls at the moment. Why not{" "}
            <Link href="/new-poll" className="underline" prefetch={false}>
              create one
            </Link>
            ?
          </p>
        )}
      </div>
      {!showAll ? (
        <Button variant="pill" size="pill" onClick={() => setShowAll(true)}>
          Show more
        </Button>
      ) : (
        <Button variant="pill" size="pill" onClick={() => setShowAll(false)}>
          Show less
        </Button>
      )}
    </>
  );
}

export const Card = ({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) => (
  <div
    className={cn("w-full p-4 rounded-xl bg-white/10 text-white", className)}
  >
    {children}
  </div>
);
