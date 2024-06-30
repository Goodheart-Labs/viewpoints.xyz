import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-center items-center p-12">
      <p className="text-2xl font-semibold text-center text-gray-500">
        Sorry, we couldn&apos;t find the poll you&apos;re looking for
      </p>
      <Link
        href="/"
        className="mt-4 font-bold tracking-wide text-white hover:underline"
      >
        View Polls
      </Link>
    </div>
  );
}
