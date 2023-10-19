import { useEffect, useRef } from "react";

export const useScrollRestoration = (showScrollArea: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (showScrollArea) {
      scrollYRef.current = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = "0px";
      document.body.style.left = "0px";
      document.body.style.right = "0px";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";

      window.scrollTo(0, scrollYRef.current);
    }
  }, [showScrollArea]);
};
