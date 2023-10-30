// import { notFound } from "next/navigation";
// import { db } from "@/db/client";
import PollIframeClient from "./client";

// Types
// -----------------------------------------------------------------------------

type PollIframeProps = {
  params: { slug: string };
};

// Data
// -----------------------------------------------------------------------------

// async function getData({ params }: PollIframeProps) {
//   const poll = await db
//     .selectFrom("polls")
//     .selectAll()
//     .where("slug", "=", params.slug)
//     .executeTakeFirst();

//   if (!poll) {
//     notFound();
//   }

//   // const statement = await db.statement.findMany({
//   //   where: {
//   //     poll_id: poll.id,
//   //   },
//   //   orderBy: {
//   //     created_at: "asc",
//   //   },
//   //   include: {
//   //     author: true,
//   //   },
//   // });

//   const statement = await db
//     .selectFrom("Statement")
//     .selectAll()
//     .where("poll_id", "=", poll.id)
//     .execute();

//   // const

//   return { poll, statement };
// }

// Default export
// -----------------------------------------------------------------------------

// eslint-disable-next-line no-empty-pattern
const PollIframe = async ({}: PollIframeProps) => (
  // const { statement } = await getData({ params });
  <PollIframeClient />
);
export default PollIframe;
