import supabaseConfig from "@/config/supabase";
import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, PropsWithChildren } from "react";

// Client
// -----------------------------------------------------------------------------

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

// Types
// -----------------------------------------------------------------------------

type SupabaseContextType = {
  client: typeof supabase;
};

// Context
// -----------------------------------------------------------------------------

const SupabaseContext = createContext<SupabaseContextType>({
  client: supabase,
});

// Hook
// -----------------------------------------------------------------------------

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useModal must be used within a SupabaseProvider");
  }
  return context;
};

// Provider
// -----------------------------------------------------------------------------

const SupabaseProvider = ({ children }: PropsWithChildren<{}>) => (
  <SupabaseContext.Provider value={{ client: supabase }}>
    {children}
  </SupabaseContext.Provider>
);

export default SupabaseProvider;
