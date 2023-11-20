import { Input } from "@/app/components/shadcn/ui/input";
import { Label } from "@/app/components/shadcn/ui/label";

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
