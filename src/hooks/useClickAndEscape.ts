import { RefObject, useEffect } from "react";
import { InteractionEvent } from "@/@types/interfaces";

export const useClickAndEscape = (
  ref: RefObject<HTMLElement>,
  isActive: boolean,
  callback: () => void
) => {
  useEffect(() => {
    const handleInteraction = (event: InteractionEvent) => {
      if (
        ref.current &&
        event instanceof MouseEvent &&
        !ref.current.contains(event.target as Node)
      ) {
        callback();
      }

      if (event instanceof KeyboardEvent && event.key === "Escape") {
        callback();
      }
    };

    if (isActive) {
      document.addEventListener("mousedown", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      document.addEventListener("keydown", handleInteraction);
    }

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [isActive, callback, ref]);
};