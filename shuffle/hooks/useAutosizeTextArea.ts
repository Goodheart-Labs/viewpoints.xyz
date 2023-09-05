import { useEffect, useRef } from "react";

export const useAutosizeTextArea = (value: string) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "0px";
      const { scrollHeight } = ref.current;

      const parentHeight = ref.current.parentElement?.clientHeight || 0;

      ref.current.style.height = `${Math.max(parentHeight, scrollHeight)}px`;
    }
  }, [value]);

  return ref;
};
