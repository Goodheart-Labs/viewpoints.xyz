import { useEffect, useLayoutEffect, useRef, useState } from "react";

import clsx from "clsx";

export const contentClasses = "text-lg text-gray-800 dark:text-gray-400";
export const contentMinHeight = 70;

// Types
// -----------------------------------------------------------------------------

type EditingContentViewProps = {
  data: {
    placeholder?: string;
  };
  refs: {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
  };
  state: {
    value: string;
    setValue: (value: string) => void;
  };
  callbacks: {
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  };
};

type EditingContentProps = {
  card: {
    author_name: string | null;
    author_avatar_url: string | null;
    text: string;
  };
  setValue: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
};

// View
// -----------------------------------------------------------------------------

const EditingContentView = ({
  data: { placeholder },
  refs: { textareaRef },
  state: { value, setValue },
  callbacks: { onKeyDown },
}: EditingContentViewProps) => (
  <textarea
    ref={textareaRef}
    className={clsx(
      contentClasses,
      "w-full text-lg text-gray-700 resize-none focus:outline-none focus:text-black hover:bg-gray-100 focus:bg-gray-100",
    )}
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
  />
);

// Default export
// -----------------------------------------------------------------------------

const EditingContent = ({
  card,
  setValue,
  onCancel,
  placeholder,
}: EditingContentProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(card.text);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }, 0);
  }, []);

  useLayoutEffect(() => {
    setValue(localValue);

    if (!textareaRef.current) return;

    textareaRef.current.style.height = "inherit";
    textareaRef.current.style.height = `${Math.max(
      textareaRef.current.scrollHeight,
      contentMinHeight,
    )}px`;
  }, [localValue, setValue]);

  return (
    <EditingContentView
      refs={{ textareaRef }}
      data={{ placeholder }}
      state={{ value: localValue, setValue: setLocalValue }}
      callbacks={{ onKeyDown }}
    />
  );
};

export default EditingContent;
