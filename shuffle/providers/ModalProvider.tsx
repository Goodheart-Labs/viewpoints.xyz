import clsx from "clsx";
import { motion } from "framer-motion";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

// Types
// -----------------------------------------------------------------------------

type ModalKey = "error";

type Modal = {
  id: ModalKey;
  render: (props?: any) => React.ReactNode;
  permanent?: boolean;
};

type ModalContextType = {
  modal?: Modal;
  setModal: Dispatch<SetStateAction<Modal | undefined>>;
};

// Modals
// -----------------------------------------------------------------------------

export const ErrorModal = () => (
  <div className="flex flex-col">
    <h2 className="mb-4 text-xl font-semibold">Error</h2>
    <div className="flex flex-col">
      <p>An error has occurred. Please refresh and try again.</p>
    </div>
  </div>
);

// View
// -----------------------------------------------------------------------------

const ModalView = () => {
  const { modal, setModal } = useModal();

  const onCancel = useCallback(() => setModal(undefined), [setModal]);

  if (!modal) return null;

  return (
    <>
      <div className="fixed z-50 top-[30vh] h-[200px] flex w-full justify-center items-center">
        <div className="bg-white dark:bg-gray-700 max-w-[600px] w-full rounded-lg">
          <div className="p-8">{modal.render()}</div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={clsx(
          "fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80",
          "z-40"
        )}
        onClick={modal.permanent ? undefined : onCancel}
      />
    </>
  );
};

// Context
// -----------------------------------------------------------------------------

const ModalContext = createContext<ModalContextType>({
  modal: undefined,
  setModal: () => {},
});

// Hook
// -----------------------------------------------------------------------------

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

// Provider
// -----------------------------------------------------------------------------

const ModalProvider = ({ children }: PropsWithChildren<{}>) => {
  const [modal, setModal] = useState<Modal | undefined>();

  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      {children}
      <ModalView />
    </ModalContext.Provider>
  );
};

export default ModalProvider;
