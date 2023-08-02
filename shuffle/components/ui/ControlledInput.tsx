import { ChangeEvent } from "react";
import { InputHTMLAttributes, useCallback, useState } from "react";

type ControlledInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  onChange: (value: string) => void;
};

const ControlledInput = ({
  value: propValue,
  onChange: propOnChange,
  ...props
}: ControlledInputProps) => {
  const [value, setValue] = useState(propValue);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      propOnChange(e.target.value);
    },
    [propOnChange],
  );

  return <input type="text" value={value} onChange={onChange} {...props} />;
};

export default ControlledInput;
