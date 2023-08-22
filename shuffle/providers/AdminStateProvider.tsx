"use client";

/* eslint-disable */

import type { PropsWithChildren } from "react";
import { createContext, useContext, useState } from "react";

// Types
// -----------------------------------------------------------------------------

type AdminState = {
  editingAnalytics: boolean;
};

type AdminStateValue = {
  adminState: AdminState;
  setAdminState: React.Dispatch<React.SetStateAction<AdminState>>;
};

// Context
// -----------------------------------------------------------------------------

const defaultAdminState: AdminState = {
  editingAnalytics: false,
};

const AdminState = createContext<AdminStateValue>({
  adminState: defaultAdminState,
  setAdminState: () => {},
});

// Hook
// -----------------------------------------------------------------------------

export const useAdminState = () => useContext(AdminState);

// Provider
// -----------------------------------------------------------------------------

const AdminStateProvider = ({ children }: PropsWithChildren<{}>) => {
  const [adminState, setAdminState] = useState<AdminState>(defaultAdminState);

  return (
    <AdminState.Provider value={{ adminState, setAdminState }}>
      {children}
    </AdminState.Provider>
  );
};

export default AdminStateProvider;
