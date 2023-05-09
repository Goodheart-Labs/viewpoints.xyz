import { useEffect, useState } from "react";

const useOverridableState = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return [value, setValue] as const;
};

export default useOverridableState;
