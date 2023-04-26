import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CardContent, contentClasses, contentMinHeight } from "./Card";
import clsx from "clsx";

// Types
// -----------------------------------------------------------------------------

type EditingContentViewProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  setValue: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

type EditingContentProps = {
  card: CardContent;
  setValue: (value: string) => void;
  onCancel: () => void;
};

// View
// -----------------------------------------------------------------------------

const EditingContentView = ({
  textareaRef,
  value,
  setValue,
  onKeyDown,
}: EditingContentViewProps) => (
  <textarea
    ref={textareaRef}
    className={clsx(
      contentClasses,
      "w-full text-lg text-gray-700 resize-none focus:outline-none focus:text-black hover:bg-gray-100 focus:bg-gray-100"
    )}
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onKeyDown={onKeyDown}
  />
);

// Default export
// -----------------------------------------------------------------------------

const EditingContent = ({ card, setValue, onCancel }: EditingContentProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(card.comment);

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
        textareaRef.current.value.length
      );
    }, 0);
  }, []);

  useLayoutEffect(() => {
    setValue(localValue);

    if (!textareaRef.current) return;

    textareaRef.current.style.height = "inherit";
    textareaRef.current.style.height = `${Math.max(
      textareaRef.current.scrollHeight,
      contentMinHeight
    )}px`;
  }, [localValue, setValue]);

  return (
    <EditingContentView
      textareaRef={textareaRef}
      value={localValue}
      setValue={setLocalValue}
      onKeyDown={onKeyDown}
    />
  );
};

export default EditingContent;
