import { auth } from "@clerk/nextjs/server";
import { HeaderView } from "./HeaderView";

export const Header = () => {
  const { userId } = auth();
  return <HeaderView userId={userId} />;
};
