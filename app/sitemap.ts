import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/constants";
import { getPolls } from "@/app/helpers";

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const polls = await getPolls();
    const pollPages = polls.map((poll) => ({
      url: `${getBaseUrl()}/poll/${poll.slug}`,
      priority: 0.5,
      lastModified: new Date(poll.created_at!),
    }));
    const staticPages = [
      {
        url: `${getBaseUrl()}/`,
        priority: 1,
        lastModified: new Date("2024-05-15"),
      },
    ];
    return [...pollPages, ...staticPages];
  } catch (e) {
    return [];
  }
}
