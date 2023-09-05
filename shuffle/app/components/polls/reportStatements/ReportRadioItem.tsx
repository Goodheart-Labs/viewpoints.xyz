import { Label } from "@/shadcn/label";
import { RadioGroupItem } from "@/shadcn/radio-group";

type ReportRadioItemProps = {
  reason: string;
  value: string;
  label: string;
};

export const ReportRadioItem = ({
  reason,
  value,
  label,
}: ReportRadioItemProps) => (
  <div
    className={`flex ${
      value === reason && "bg-white"
    } items-center bg-accent text-secondary rounded-full`}
  >
    <RadioGroupItem
      value={value}
      id={value}
      className={`ml-2 ${value === reason && "bg-black"} ''`}
    />
    <Label
      htmlFor={value}
      className={`w-full h-full p-2 ${value === reason && "text-black"} ''`}
    >
      {label}
    </Label>
  </div>
);
