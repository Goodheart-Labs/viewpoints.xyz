// TODO: validation

"use client";

import CommentsList from "@/app/components/polls/new/CommentsList";
import BorderedButton from "@/components/BorderedButton";
import ControlledInput from "@/components/ui/ControlledInput";
import { CheckIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useMutation } from "react-query";

// Types
// -----------------------------------------------------------------------------

type NewPollPageClientProps = {};

type NewPollPageClientViewProps = {
  state: {
    loading: boolean;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    polisId: string;
    setPolisId: React.Dispatch<React.SetStateAction<string>>;
    question: string;
    setQuestion: React.Dispatch<React.SetStateAction<string>>;
  };
  callbacks: {
    onCommentsChange: (comments: Comment[]) => void;
    onSubmit: () => void;
  };
};

type Comment = string;

// View
// -----------------------------------------------------------------------------

const NewPollPageClientView = ({
  state: {
    title,
    setTitle,
    polisId,
    setPolisId,
    question,
    setQuestion,
    loading,
  },
  callbacks: { onCommentsChange, onSubmit },
}: NewPollPageClientViewProps) => (
  <div className="flex flex-col w-full">
    <div className="flex flex-col w-full">
      <h3 className="mb-2 text-xl font-semibold">Poll Title</h3>
      <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
        Give it a catchy name
      </h4>

      <ControlledInput
        type="text"
        className="w-full text-lg"
        autoFocus
        value={title}
        onChange={setTitle}
      />
    </div>

    <div className="flex flex-col w-full mt-10">
      <h3 className="mb-2 text-xl font-semibold">Polis ID</h3>
      <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
        What is the Polis ID for the corresponding poll?
      </h4>

      <ControlledInput
        type="text"
        className="w-full text-lg"
        value={polisId}
        onChange={setPolisId}
      />
    </div>

    <div className="flex flex-col w-full mt-10">
      <h3 className="mb-2 text-xl font-semibold">Main Question</h3>
      <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
        What&apos;s the key question you&apos;re trying to answer?
      </h4>

      <ControlledInput
        type="text"
        className="w-full text-lg"
        value={question}
        onChange={setQuestion}
      />
    </div>

    <div className="flex flex-col w-full mt-10">
      <h3 className="mb-2 text-xl font-semibold">Comments</h3>
      <h4 className="mb-4 text-lg text-gray-700 dark:text-gray-200">
        Add 10-20 comments that people can respond to.
      </h4>

      <CommentsList
        data={{ title, question }}
        callbacks={{ onCommentsChange }}
      />
    </div>

    <div className="flex items-center justify-end w-full py-4 my-10 bg-gray-50 dark:bg-gray-950">
      <div>
        <BorderedButton color="green" onClick={onSubmit} disabled={loading}>
          <CheckIcon className="w-5" /> Save and Publish Poll
        </BorderedButton>
      </div>
    </div>
  </div>
);

// Default export
// -----------------------------------------------------------------------------

const NewPollPageClient = ({}: NewPollPageClientProps) => {
  const router = useRouter();

  // State

  const [title, setTitle] = useState("");
  const [polisId, setPolisId] = useState("");
  const [question, setQuestion] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  // Mutations
  const newPollMutation = useMutation(
    async ({
      title,
      polisId,
      question,
      comments,
    }: {
      title: string;
      polisId: string;
      question: string;
      comments: Comment[];
    }) => {
      await axios.post(`/api/polls`, {
        title,
        polisId,
        question,
        comments,
      });
    }
  );

  // Callbacks

  const onCommentsChange = useCallback(
    (comments: Comment[]) =>
      setComments(comments.filter((c) => c.trim() !== "")),
    []
  );

  const onSubmit = useCallback(async () => {
    await newPollMutation.mutateAsync({
      title,
      polisId,
      question,
      comments,
    });

    router.push(`/polls/${polisId}`);
  }, [newPollMutation, title, polisId, question, comments, router]);

  // Render

  return (
    <NewPollPageClientView
      state={{
        loading: newPollMutation.isLoading,
        title,
        setTitle,
        polisId,
        setPolisId,
        question,
        setQuestion,
      }}
      callbacks={{ onCommentsChange, onSubmit }}
    />
  );
};

export default NewPollPageClient;
