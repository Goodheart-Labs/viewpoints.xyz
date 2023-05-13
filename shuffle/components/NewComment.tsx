import { CheckIcon, PlusIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import Avatar from "./Avatar";
import BorderedButton from "./BorderedButton";
import EditingContent from "./EditingContent";
import { anonymousAvatar } from "./Cards";
import { Comment } from "@/lib/api";
import { useUser } from "@clerk/nextjs";

// Types
// -----------------------------------------------------------------------------

type NewCommentViewProps = {
  data: {
    card: Omit<Comment, "id" | "poll_id" | "created_at">;
  };
  state: {
    editingValue: string;
    setEditingValue: (value: string) => void;
  };
  callbacks: {
    onCancel: () => void;
    onSave: () => void;
  };
};

type NewCommentProps = {
  onCreate: (value: string) => void;
  onCancel: () => void;
};

// View
// -----------------------------------------------------------------------------

const NewCommentView = ({
  data: { card },
  state: { editingValue, setEditingValue },
  callbacks: { onCancel, onSave },
}: NewCommentViewProps) => (
  <>
    <div className="fixed z-50 flex top-[30vh] bg-white flex-col w-[600px] items-center justify-center rounded-lg">
      <div className="z-50 flex flex-col w-full px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center w-full">
            <div className="mr-2">
              <Avatar
                url={card.author_avatar_url ?? anonymousAvatar}
                alt={card.author_name ?? "Anonymous"}
              />
            </div>
            <div className="text-sm font-semibold text-gray-600">
              {card.author_name ?? "Anonymous"}
            </div>
          </div>
          <div>
            <div className="p-1 bg-blue-200 rounded-full">
              <PlusIcon className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="flex w-full">
          <EditingContent
            card={card}
            onCancel={onCancel}
            setValue={setEditingValue}
            placeholder="Add a comment..."
          />
        </div>
      </div>
      <div className="w-full px-4 py-4 rounded-b-lg bg-gray-50 sm:px-6">
        <div className="flex justify-end">
          <div>
            <BorderedButton
              onClick={onSave}
              color="green"
              disabled={editingValue.length === 0}
            >
              <CheckIcon width={22} height={22} className="mr-1" /> Add New
              Comment
            </BorderedButton>
          </div>
        </div>
      </div>
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        "fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50",
        "z-40"
      )}
      onClick={onCancel}
    />
  </>
);

// Default export
// -----------------------------------------------------------------------------

const NewComment = ({ onCreate, onCancel }: NewCommentProps) => {
  const { user } = useUser();
  const [editingValue, setEditingValue] = useState("");

  const card = useMemo(
    () => ({
      author_name: user?.fullName ?? "Anonymous",
      author_avatar_url: user?.profileImageUrl ?? anonymousAvatar,
      comment: editingValue,
    }),
    [editingValue, user?.fullName, user?.profileImageUrl]
  );

  const onSave = useCallback(() => {
    onCreate(editingValue);
  }, [editingValue, onCreate]);

  return (
    <NewCommentView
      data={{ card }}
      state={{
        editingValue,
        setEditingValue,
      }}
      callbacks={{ onCancel, onSave }}
    />
  );
};

export default NewComment;
