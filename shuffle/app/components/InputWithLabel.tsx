import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";

type Props = {
  label: string;
  value: string;
};

export const InputWithLabel = ({ label, value }: Props) => (
  <div className="grid w-full items-center gap-1.5 mb-4">
    <Label htmlFor="email" className="text-muted flex justify-between">
      <span>{label}</span>
      <span>{value.length}/80</span>
    </Label>
    <Input
      className="disabled:text-secondary disabled:bg-muted"
      type="text"
      id="email"
      placeholder="Email"
      disabled
      value={value}
    />
  </div>
);
