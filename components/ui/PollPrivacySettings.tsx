"use client";

import {
  Link2Icon,
  LockClosedIcon,
  LockOpen2Icon,
} from "@radix-ui/react-icons";
import type { Poll } from "@/db/schema";
import { Label } from "@/app/components/shadcn/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/app/components/shadcn/ui/radio-group";

type PollPrivacySettingsProps = {
  visibility: Poll["visibility"];
  pollVisibilitySetter: (visibility: Poll["visibility"]) => void;
};

const PollPrivacySettings = ({
  visibility,
  pollVisibilitySetter,
}: PollPrivacySettingsProps) => (
  <RadioGroup
    value={visibility}
    className="flex w-full gap-0 bg-background rounded-l-xl rounded-r-xl"
    onValueChange={(value) => pollVisibilitySetter(value as Poll["visibility"])}
  >
    <div className="relative flex items-center w-1/3 space-x-2 rounded-l-xl">
      <RadioGroupItem
        value="public"
        id="public"
        className="w-full h-12 border-none rounded-none first:aria-checked:bg-white peer rounded-l-xl"
      />
      <Label
        htmlFor="public"
        className="absolute flex items-center justify-center w-full h-full text-white rounded-r-sm cursor-pointer peer-aria-checked:text-black"
      >
        <LockOpen2Icon className="mr-2" />
        Public
      </Label>
    </div>
    <div className="relative flex items-center w-1/3 space-x-2">
      <RadioGroupItem
        value="hidden"
        id="hidden"
        className="w-full h-12 border-none rounded-none first:aria-checked:bg-white peer"
      />
      <Label
        htmlFor="hidden"
        className="absolute flex items-center justify-center w-full h-full text-white cursor-pointer peer-aria-checked:text-black"
      >
        <Link2Icon className="mr-2" />
        Private Link
      </Label>
    </div>
    <div className="relative flex items-center w-1/3 space-x-2 rounded-r-xl">
      <RadioGroupItem
        value="private"
        id="private"
        className="w-full h-12 border-none rounded-none first:aria-checked:bg-white peer rounded-r-xl"
      />
      <Label
        htmlFor="private"
        className="absolute flex items-center justify-center w-full h-full text-white cursor-pointer peer-aria-checked:text-black"
      >
        <LockClosedIcon className="mr-2" />
        Closed
      </Label>
    </div>
  </RadioGroup>
);
export default PollPrivacySettings;
