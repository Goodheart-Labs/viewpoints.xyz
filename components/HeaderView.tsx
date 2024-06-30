"use client";

import { useState } from "react";
import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/shadcn/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "react-query";
import { Logo } from "./Logo";

export function HeaderView() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);
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

  // Callbacks
  const onClickLogin = () => {
    setShowSignIn(true);
  };

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
          <Link
            href="/user/polls"
            className="text-white hover:opacity-50 text-sm"
          >
            My Polls
          </Link>
          <Link
            href="/user/account"
            className="text-white hover:opacity-50 text-sm"
          >
            Account
          </Link>
          <Button variant="pill" size="pill" className="mr-2" asChild>
            <Link href="/new-poll" prefetch={false}>
              <PlusCircle className="w-3 mr-2" /> Create Poll
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="z-50">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Button variant="pill" size="pill" onClick={onClickLogin}>
            Login
          </Button>
        )}
      </div>

      {showSignIn && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={clsx(
              "fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 z-40",
            )}
            onClick={() => setShowSignIn(false)}
          />
          <div className="fixed z-[100] top-[30vh] h-[200px] flex w-full justify-center items-center">
            <SignIn />
          </div>
        </>
      )}
    </div>
  );
}
