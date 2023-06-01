"use client";

import { useCallback, useState } from "react";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import BorderedButton from "./BorderedButton";
import { UserButton, useUser } from "@clerk/nextjs";
import clsx from "clsx";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const { isSignedIn } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);

  const onClickLogin = useCallback(() => {
    setShowSignIn(true);
  }, []);

  useHotkeys(["l", "shift+l"], () => {
    if (isSignedIn) return;
    onClickLogin();
  });

  return (
    <div className="fixed right-0 flex items-center justify-end w-full p-4 bg-black bg-opacity-5">
      <div className="mr-auto">
        <Link href="/" className="hover:opacity-50">
          <Image
            src={"/logo.png"}
            alt="viewpoints.xyz"
            width={200}
            height={40}
          />
        </Link>
      </div>

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
              "fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 z-40"
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
