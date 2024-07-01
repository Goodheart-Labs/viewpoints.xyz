import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";

export function UpgradeLink({
  children = "Need more polls?",
}: {
  children?: React.ReactNode;
}) {
  return (
    <Link
      href="/upgrade"
      className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-2 sm:gap-4 p-4 rounded-lg border-neutral-900 border-2 bg-gradient-to-b from-transparent to-neutral-800/50 hover:border-neutral-700 text-wrap-balance upgrade-link"
    >
      <CheckBadgeIcon className="w-12 sm:w-8 sm:h-8 mx-2" />
      <div className="grid gap-0.5 flex-1">
        <span>{children}</span>
        <span className="text-base opacity-70">
          Create unlimited polls by upgrading to Viewpoints Plus
        </span>
      </div>
      <ArrowRightIcon className="w-6 h-6 mx-2" />
    </Link>
  );
}
