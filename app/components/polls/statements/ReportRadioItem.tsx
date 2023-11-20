import { Label } from "@/app/components/shadcn/ui/label";
import { RadioGroupItem } from "@/app/components/shadcn/ui/radio-group";

type ReportRadioItemProps = {
  reason: string | undefined;
  value: "off-topic" | "duplicated" | "rude-offensive" | "other";
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
      className={`w-full h-full p-2 cursor-pointer ${
        value === reason && "text-black"
      } ''`}
    >
      {label}
    </Label>
  </div>
);
