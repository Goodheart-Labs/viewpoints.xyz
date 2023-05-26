import { useCallback, useState } from "react";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import BorderedButton from "./BorderedButton";
import { UserButton, useUser } from "@clerk/nextjs";
import clsx from "clsx";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";
import { useModal } from "@/providers/ModalProvider";
import { TrackingEvent, useAmplitude } from "@/providers/AmplitudeProvider";

const AuthHeader = () => {
  const { isSignedIn } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);

  const onClickLogin = useCallback(() => {
    setShowSignIn(true);
  }, []);

  useHotkeys(["l", "shift+l"], () => {
    if (isSignedIn) return;
    onClickLogin();
  });

  const { setModal } = useModal();
  const { amplitude } = useAmplitude();

  const onNewPoll = useCallback(() => {
    amplitude.logEvent(TrackingEvent.OpenNewPoll);
    setModal({
      render: () => (
        <div>
          <h1>Coming Soon</h1>
        </div>
      ),
    });
  }, [amplitude, setModal]);

  return (
    <div className="flex justify-end p-4">
      <BorderedButton color="orange" onClick={onNewPoll} className="mr-2">
        Create New Poll
      </BorderedButton>

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

export default AuthHeader;
