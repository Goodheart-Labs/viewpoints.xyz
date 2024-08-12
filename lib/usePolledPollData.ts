import type { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { notFound, useParams } from "next/navigation";
import { useQuery } from "react-query";

export const POLLED_POLL_QUERY_KEY = "/polls/[slug]";
export function usePolledPollData(
  initialData: Awaited<ReturnType<typeof getData>>,
) {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery({
    queryKey: [POLLED_POLL_QUERY_KEY, slug],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${slug}`);
      return res.json() as ReturnType<typeof getData>;
    },
    initialData,
    refetchInterval: 15_000,
    staleTime: 15_000,
  });

  if (!data) {
    notFound();
  }

  return data;
}
