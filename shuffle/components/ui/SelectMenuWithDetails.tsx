import { Fragment, useCallback, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { polls_visibility_enum } from "@prisma/client";

// Types
// -----------------------------------------------------------------------------

type Option = {
  id: polls_visibility_enum;
  title: string;
  description: string;
};

type SelectMenuWithDetailsProps = {
  title: string;
  options: Option[];
  value?: Option["id"];
  onChange?: (value: Option["id"]) => void;
};

// Default export
// -----------------------------------------------------------------------------

const SelectMenuWithDetails = ({
  title,
  options,
  value,
  onChange: propsOnChange,
}: SelectMenuWithDetailsProps) => {
  const [selected, setSelected] = useState(
    (value ? options.find((o) => o.id === value) : null) ?? options[0],
  );

  const onChange = useCallback(
    (value: Option) => {
      setSelected(value);
      propsOnChange?.(value.id);
    },
    [propsOnChange],
  );

  return (
    <Listbox value={selected} onChange={onChange}>
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">{title}</Listbox.Label>
          <div className="relative">
            <div className="inline-flex divide-x divide-indigo-700 rounded-md shadow-sm">
              <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm">
                <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                <p className="text-sm font-semibold">{selected.title}</p>
              </div>
              <Listbox.Button className="inline-flex items-center p-2 bg-indigo-600 rounded-l-none rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                <span className="sr-only">Change published status</span>
                <ChevronDownIcon
                  className="w-5 h-5 text-white"
                  aria-hidden="true"
                />
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute left-0 z-10 mt-2 overflow-hidden origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg w-72 ring-1 ring-black ring-opacity-5 focus:outline-none">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      clsx(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "cursor-default select-none p-4 text-sm",
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p
                            className={
                              selected ? "font-semibold" : "font-normal"
                            }
                          >
                            {option.title}
                          </p>
                          {selected ? (
                            <span
                              className={
                                active ? "text-white" : "text-indigo-600"
                              }
                            >
                              <CheckIcon
                                className="w-5 h-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={clsx(
                            active ? "text-indigo-200" : "text-gray-500",
                            "mt-2",
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default SelectMenuWithDetails;
