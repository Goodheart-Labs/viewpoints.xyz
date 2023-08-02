"use client";

import { useCallback, useMemo, useState } from "react";

import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCurrentPoll } from "@/providers/CurrentPollProvider";

import BorderedButton from "./BorderedButton";

const Header = () => {
  // State

  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);

  const { currentPoll } = useCurrentPoll();

  const isCurrentPollAdmin = useMemo(
    () => currentPoll && currentPoll.user_id === user?.id,
    [currentPoll, user?.id],
  );

  // Callbacks

  const onClickLogin = useCallback(() => {
    setShowSignIn(true);
  }, []);

  const onClickPollAdmin = useCallback(() => {
    router.push(`/polls/${currentPoll?.slug}/admin`);
  }, [currentPoll?.slug, router]);

  useHotkeys(["l", "shift+l"], () => {
    if (isSignedIn) return;
    onClickLogin();
  });

  // Render

  return (
    <div className="flex items-center justify-end w-full p-4">
      <div className={clsx(!(isSignedIn && isCurrentPollAdmin) && "mr-auto")}>
        <Link href="/" className="hover:opacity-50">
          <div className="dark:hidden">
            <Image
              src={"/logo.png"}
              alt="viewpoints.xyz"
              width={200}
              height={40}
            />
          </div>
          <div className="hidden dark:block">
            <Image
              src={"/logo-dark.png"}
              alt="viewpoints.xyz"
              width={200}
              height={40}
            />
          </div>
        </Link>
      </div>

      {isSignedIn && isCurrentPollAdmin ? (
        <div className="mx-auto">
          <BorderedButton color="yellow" onClick={onClickPollAdmin}>
            Poll Admin
          </BorderedButton>
        </div>
      ) : null}

      {isSignedIn ? (
        <Link href="/polls/new">
          <BorderedButton color="orange" className="mr-2">
            Create New Poll
          </BorderedButton>
        </Link>
      ) : null}

      <div className="z-50">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <BorderedButton color="indigo" onClick={onClickLogin}>
            Login
          </BorderedButton>
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
          <div className="fixed z-50 top-[30vh] h-[200px] flex w-full justify-center items-center">
            <SignIn redirectUrl={window.location.pathname} />
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
