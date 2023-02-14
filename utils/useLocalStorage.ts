import { useEffect, useState } from "react";

// https://upmostly.com/next-js/using-localstorage-in-next-js
export default function useLocalStorage<T>(key: string, fallbackValue: T) {
  const [value, setValue] = useState(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return stored ? JSON.parse(stored) : fallbackValue;
  });

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setValue(stored ? JSON.parse(stored) : fallbackValue);
  }, [fallbackValue, key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
