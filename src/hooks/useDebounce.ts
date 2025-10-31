import { useState, useEffect } from "react";

// Hook này giúp trì hoãn việc cập nhật một giá trị,
// chỉ cập nhật sau khi người dùng ngừng thay đổi nó trong một khoảng thời gian.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
