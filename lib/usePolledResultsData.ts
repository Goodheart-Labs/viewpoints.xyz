import { notFound, useParams } from "next/navigation";
import { useQuery } from "react-query";
import type { getPollResults } from "./pollResults/getPollResults";

export function usePolledResultsData(
  initialData: Awaited<ReturnType<typeof getPollResults>>,
) {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery({
    queryKey: ["/polls/[slug]/results", slug],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${slug}/results`);
      return res.json() as ReturnType<typeof getPollResults>;
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
