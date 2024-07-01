import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Success() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircleIcon className="w-12 h-12 text-green-500" />
          <SparklesIcon className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold">Thank You for Signing Up!</h1>
        <p className="text-xl text-zinc-300">
          Welcome to Viewpoints. We&apos;re excited to have you on board!
        </p>
        <Link
          href="/user/polls"
          className="inline-block px-6 py-3 text-lg font-semibold text-white border-2 border-white bg-zinc-900 rounded-full hover:bg-zinc-800 hover:text-zinc-200 transition duration-300"
        >
          View Your Polls
        </Link>
      </div>
    </div>
  );
}
