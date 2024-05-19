import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/constants";
import { getPublicPolls } from "@/app/helpers";

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const polls = await getPublicPolls();
    const mostRecentPoll = polls[0];
    const pollPages = polls.map((poll) => ({
      url: `${getBaseUrl()}/poll/${poll.slug}`,
      priority: 0.5,
      lastModified: new Date(poll.created_at!),
    }));
    const staticPages = [
      {
        url: `${getBaseUrl()}/`,
        priority: 1,
        lastModified: mostRecentPoll?.created_at,
      },
    ];
    return [...pollPages, ...staticPages];
  } catch (e) {
    return [];
  }
}
