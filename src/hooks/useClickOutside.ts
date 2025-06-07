import { RefObject, useEffect } from "react";
import { ClickOutsideEvent } from "@/@types/interfaces";

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  isActive: boolean
) => {
  useEffect(() => {
    const handleClickOutside = (event: ClickOutsideEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    if (isActive) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, callback, isActive]);
};