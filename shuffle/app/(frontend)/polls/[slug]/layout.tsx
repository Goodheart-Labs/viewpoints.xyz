import prisma from "@/lib/prisma";
import AdminStateProvider from "@/providers/AdminStateProvider";

// Types
// -----------------------------------------------------------------------------

type Params = {
  slug: string;
};

// Data
// -----------------------------------------------------------------------------

async function getData({ slug }: Params) {
  const poll = await prisma.polls.findUnique({
    where: { slug },
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { poll } = await getData(params);

  return (
    <AdminStateProvider>
      <div className="flex flex-col">
        {/* TODO */}
        {/* <AdminPill poll={poll} /> */}
        <div className="flex flex-col">{children}</div>
      </div>
    </AdminStateProvider>
  );
};

export default PollLayout;
