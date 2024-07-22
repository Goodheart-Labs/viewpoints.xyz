"use client";

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import clsx from "clsx";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/shadcn/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "react-query";
import { Logo } from "./Logo";

export function HeaderView() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { slug } = useParams();

  const { data: isAdmin } = useQuery(
    ["polls", slug],
    async () => {
      if (!slug) return false;
      if (slug === "new") return false;
      if (user?.publicMetadata.isSuperAdmin) return true;
      const response = await fetch(`/api/public/is-admin/${slug}`);
      const data = (await response.json()) as { isAdmin: boolean };
      return data.isAdmin;
    },
    {
      enabled: isSignedIn,
    },
  );

  const onClickPollAdmin = () => {
    router.push(`/polls/${slug}/admin`);
  };

  return (
    <div className="self-start flex items-center justify-end w-full p-4 sticky top-0 bg-zinc-900 z-[60]">
      <div className={clsx(!(isSignedIn && isAdmin) && "mr-auto")}>
        <Link href="/" className="hover:opacity-50">
          <Logo width={160} height={24} />
        </Link>
      </div>

      {isSignedIn && isAdmin ? (
        <div className="mx-auto">
          <Button variant="pill" size="pill" onClick={onClickPollAdmin}>
            Poll Admin
          </Button>
        </div>
      ) : null}

      {isSignedIn ? (
        <div className="flex gap-3 items-center">
          <Button variant="pill" size="pill" asChild>
            <Link href="/new-poll" prefetch={false}>
              <PlusCircle className="w-3 mr-2" /> Create Poll
            </Link>
          </Button>
          <Link
            href="/user/polls"
            className="text-white hover:opacity-50 text-sm"
          >
            My Polls
          </Link>
          <Link
            href="/user/account"
            className="text-white hover:opacity-50 text-sm mr-4"
          >
            Account
          </Link>
        </div>
      ) : null}

      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <SignInButton>Login</SignInButton>
      )}
    </div>
  );
}
