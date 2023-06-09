"use client";

import BorderedButton from "@/components/BorderedButton";
import { Poll } from "@/lib/api";
import { useAdminState } from "@/providers/AdminStateProvider";
import { isPollAdmin } from "@/utils/authutils";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

// Types
// -----------------------------------------------------------------------------

type AdminPillViewProps = {
  data: {
    poll: Poll;
  };
  state: {
    editingAnalytics: boolean;
    setEditingAnalytics: (editingAnalytics: boolean) => void;
  };
};

// View
// -----------------------------------------------------------------------------

const AdminPillView = ({
  data: { poll },
  state: { editingAnalytics, setEditingAnalytics },
}: AdminPillViewProps) => (
  <div className="fixed left-0 flex p-4">
    <BorderedButton
      color="yellow"
      onClick={() => setEditingAnalytics(!editingAnalytics)}
    >
      {editingAnalytics ? "Done" : "Edit Mode"}
    </BorderedButton>
  </div>
);

// Default export
// -----------------------------------------------------------------------------

const AdminPill = ({ poll }: { poll: Poll | null }) => {
  const { userId } = useAuth();
  const { adminState, setAdminState } = useAdminState();

  const editingAnalytics = adminState.editingAnalytics;

  const setEditingAnalytics = (editingAnalytics: boolean) =>
    setAdminState((state) => ({ ...state, editingAnalytics }));

  if (!isPollAdmin(poll, userId)) {
    return null;
  }

  return (
    <AdminPillView
      data={{ poll }}
      state={{
        editingAnalytics,
        setEditingAnalytics,
      }}
    />
  );
};

export default AdminPill;
