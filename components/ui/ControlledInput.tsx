import { Input } from "@/app/components/polls/poll-components";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useState } from "react";

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

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    propOnChange(e.target.value);
  };

  return <Input type="text" value={value} onChange={onChange} {...props} />;
};

export default ControlledInput;
