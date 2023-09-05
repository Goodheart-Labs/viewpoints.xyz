import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";

type Props = {
  label: string;
  value: string;
};

export const DisabledInputWithLabel = ({ label, value }: Props) => (
  <div className="grid w-full items-center gap-1.5 mb-4">
    <Label className="text-muted flex justify-between">
      <span>{label}</span>
      <span>{value.length}/80</span>
    </Label>
    <Input
      className="disabled:text-secondary disabled:bg-muted"
      type="text"
      disabled
      value={value}
    />
  </div>
);
