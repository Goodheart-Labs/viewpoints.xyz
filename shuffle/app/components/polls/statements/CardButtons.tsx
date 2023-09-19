import type { FC } from "react";
import React from "react";

import type { Choice } from "@/lib/api";

type Props = {
  onResponse: (choice: Choice) => void;
};

export const CardButtons: FC<Props> = ({ onResponse }) => (
  <div className="flex justify-between items-center">
    <button
      type="button"
      onClick={() => onResponse("itsComplicated")}
      className="bg-zinc-700 hover:bg-zinc-600 rounded-full w-10 h-10"
    >
      🤔
    </button>
    <button
      type="button"
      onClick={() => onResponse("disagree")}
      className="bg-zinc-700 hover:bg-zinc-600 rounded-full w-14 h-14"
    >
      👎
    </button>
    <button
      type="button"
      onClick={() => onResponse("agree")}
      className="bg-zinc-700 hover:bg-zinc-600 rounded-full w-14 h-14"
    >
      👍
    </button>
    <button
      type="button"
      onClick={() => onResponse("skip")}
      className="bg-zinc-700 hover:bg-zinc-600 rounded-full w-10 h-10"
    >
      🤷
    </button>
  </div>
);
