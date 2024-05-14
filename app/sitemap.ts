import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/constants";
import { db } from "@/db/client";

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  const polls = await getPolls();
  return polls.map((poll) => ({
    url: `${getBaseUrl()}/poll/${poll.slug}`,
    priority: 0.5,
    lastModified: new Date(poll.created_at!),
  }));
}

async function getPolls() {
  return db
    .selectFrom("polls")
    .selectAll()
    .where("visibility", "=", "public")
    .execute();
}
