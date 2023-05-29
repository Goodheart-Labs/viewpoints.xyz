import AdminPill from "@/app/components/admin/AdminPill";
import prisma from "@/lib/prisma";
import AdminStateProvider from "@/providers/AdminStateProvider";

// Types
// -----------------------------------------------------------------------------

type Params = {
  polisId: string;
};

// Data
// -----------------------------------------------------------------------------

async function getData({ polisId }: Params) {
  const poll = await prisma.polls.findUnique({
    where: { polis_id: polisId },
  });

  return {
    poll,
  };
}

// Default export
// -----------------------------------------------------------------------------

const PollLayout = async ({
  children,
  params,
}: React.PropsWithChildren<{
  params: Params;
}>) => {
  const { poll } = await getData(params);

  return (
    <AdminStateProvider>
      <div className="flex flex-col">
        <AdminPill poll={poll} />
        <div className="flex flex-col">{children}</div>
      </div>
    </AdminStateProvider>
  );
};

export default PollLayout;
