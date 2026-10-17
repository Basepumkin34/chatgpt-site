import { useState } from "react";
export function readStore(key, fallback, validate = () => true) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value !== null && validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function useStored(key, initial, validate) {
  const [value, setValue] = useState(() => readStore(key, initial, validate));
  return [
    value,
    (update) =>
      setValue((old) => {
        const next = typeof update === "function" ? update(old) : update;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* The app remains usable when browser storage is unavailable. */
        }
        return next;
      }),
  ];
}
