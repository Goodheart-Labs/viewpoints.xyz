"use client";

import { useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { Correlation } from "@/lib/analytics/comments";
import { Comment } from "@/lib/api";
import clsx from "clsx";
import ValenceBadge from "@/components/ValenceBadge";

// Types
// -----------------------------------------------------------------------------

type SelectCorrelatedCommentProps = {
  correlatedComments: Correlation[];
  commentIdToCommentMap: Record<number, Comment>;
  onSelected: (correlationKey: Correlation["key"]) => void;
  disabled?: boolean;
};

// Default export
// -----------------------------------------------------------------------------

const SelectCorrelatedComment = ({
  correlatedComments,
  commentIdToCommentMap,
  onSelected,
  disabled = false,
}: SelectCorrelatedCommentProps) => {
  const [query, setQuery] = useState("");
  const [selectedPerson] = useState(null);

  const filteredCorrelations =
    query === ""
      ? correlatedComments
      : correlatedComments.filter((correlation) => {
          const description = `${correlation.key} ${
            commentIdToCommentMap[correlation.commentA].comment
          } ${commentIdToCommentMap[correlation.commentB].comment}`;

          return description.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={selectedPerson}
      onChange={onSelected}
      className="w-full"
      disabled={disabled}
    >
      <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
        Add New Correlation
      </Combobox.Label>
      <div className="relative mt-2">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(correlation: Correlation | null) =>
            correlation?.key ?? ""
          }
          placeholder="Search for a correlation..."
        />

        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 rounded-r-md focus:outline-none">
          <ChevronUpDownIcon
            className="w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredCorrelations.length > 0 && (
          <Combobox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCorrelations.map((correlation) => (
              <Combobox.Option
                key={correlation.key}
                value={correlation.key}
                className={({ active }) =>
                  clsx(
                    "relative cursor-default select-none py-2 pl-3 pr-9 mb-2 border-b",
                    active ? "bg-indigo-600 text-white" : "text-gray-900",
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex flex-col">
                      <span>
                        <span className="font-bold">
                          {correlation.percentage}%
                        </span>{" "}
                        correlation between:{" "}
                      </span>

                      <span
                        className={clsx(
                          "ml-2 mt-1",
                          selected && "font-semibold",
                        )}
                      >
                        <ValenceBadge valence={correlation.commentAValence} />{" "}
                        {commentIdToCommentMap[correlation.commentA].comment}
                      </span>

                      <span
                        className={clsx(
                          "ml-2 mt-1",
                          selected && "font-semibold",
                        )}
                      >
                        <ValenceBadge valence={correlation.commentBValence} />{" "}
                        {commentIdToCommentMap[correlation.commentB].comment}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={clsx(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600",
                        )}
                      >
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default SelectCorrelatedComment;
