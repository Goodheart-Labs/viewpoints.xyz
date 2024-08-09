"use client";

import type { FC } from "react";
import React, { useCallback, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import type { SortKey } from "@/lib/pollResults/constants";
import { SORT_PARAM, sortOptions } from "@/lib/pollResults/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn/ui/select";

type Props = {
  value?: SortKey;
};

export const StatementSort: FC<Props> = ({ value }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = useCallback(
    (newValue: SortKey) => {
      router.push(`${pathname}?${SORT_PARAM}=${newValue}`, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!value) handleChange("consensus");
  }, [value, handleChange]);

  return (
    <div className="grid justify-center gap-4 sm:flex mt-4 mb-2">
      {sortOptions.map((option) => (
        <button
          key={option.name}
          type="button"
          data-state-active={option.key === value}
          className="py-.5 border-b border-transparent data-[state-active=true]:border-neutral-200 text-neutral-400 data-[state-active=true]:text-neutral-50 hover:text-neutral-100"
          onClick={() => handleChange(option.key)}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
};
