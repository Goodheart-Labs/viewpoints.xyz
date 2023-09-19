"use client";

import type { polls_visibility_enum } from "@prisma/client";
import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";

import { Label } from "@/shadcn/label";
import { RadioGroup, RadioGroupItem } from "@/shadcn/radio-group";

type PollPrivacySettingsProps = {
  visibility: polls_visibility_enum;
  pollVisibilitySetter: (visibility: polls_visibility_enum) => void;
};

const PollPrivacySettings = ({
  visibility,
  pollVisibilitySetter,
}: PollPrivacySettingsProps) => (
  <RadioGroup
    value={visibility}
    className="flex w-full bg-background gap-0 rounded-l-xl rounded-r-xl"
    onValueChange={(value) =>
      pollVisibilitySetter(value as polls_visibility_enum)
    }
  >
    <div className="flex items-center space-x-2 w-1/2 relative rounded-l-xl">
      <RadioGroupItem
        value="public"
        id="public"
        className="first:aria-checked:bg-white w-full h-12 rounded-none peer border-none rounded-l-xl"
      />
      <Label
        htmlFor="public"
        className="w-full h-full absolute flex items-center justify-center peer-aria-checked:text-black rounded-r-sm cursor-pointer"
      >
        <LockOpen2Icon className="mr-2" />
        Public
      </Label>
    </div>
    <div className="flex items-center space-x-2 w-1/2 relative rounded-r-xl">
      <RadioGroupItem
        value="private"
        id="private"
        className="first:aria-checked:bg-white w-full h-12 rounded-none peer border-none rounded-r-xl"
      />
      <Label
        htmlFor="private"
        className="w-full h-full absolute flex items-center justify-center peer-aria-checked:text-black cursor-pointer"
      >
        <LockClosedIcon className="mr-2" />
        Private
      </Label>
    </div>
  </RadioGroup>
);
export default PollPrivacySettings;
