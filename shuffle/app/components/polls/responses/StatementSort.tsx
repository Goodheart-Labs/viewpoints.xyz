"use client";

import type { FC } from "react";
import React from "react";

import { usePathname, useRouter } from "next/navigation";

import type { SortKey } from "@/lib/pollResults/constants";
import { SORT_PARAM, sortOptions } from "@/lib/pollResults/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";

type Props = {
  value?: SortKey;
};

export const StatementSort: FC<Props> = ({ value = "consensus" }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newValue: SortKey) => {
    router.push(`${pathname}?${SORT_PARAM}=${newValue}`);
  };

  return (
    <Select defaultValue={value} onValueChange={handleChange}>
      <SelectTrigger className="text-zinc-100">
        Sort by: <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
