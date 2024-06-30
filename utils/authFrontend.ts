import { useUser } from "@clerk/nextjs";

export const useIsSuperuser = () => {
  const { user } = useUser();
  return Boolean(user?.publicMetadata.isSuperAdmin);
};
