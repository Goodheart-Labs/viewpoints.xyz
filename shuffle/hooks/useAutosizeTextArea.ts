import { useEffect, useRef } from "react";

export const useAutosizeTextArea = (value: string) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "0px";
      const { scrollHeight } = ref.current;

      ref.current.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  return ref;
};
