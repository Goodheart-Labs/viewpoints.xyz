"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

type LogoProps = {
  width: number;
  height: number;
};

export const Logo = ({ width, height }: LogoProps) => {
  const pathname = usePathname();
  if (isCouncilPoll(pathname)) {
    return <span />;
  }

  if (process.env.NEXT_PUBLIC_VIEWPOINTS_LOGO === "false") {
    return <span />;
  }
  return (
    <Image
      className="max-w-[160px] sm:max-w-none"
      src="/logo-dark.png"
      alt="viewpoints.xyz"
      width={width}
      height={height}
    />
  );
};

/**
 * Matches any poll with "council" substring
 */
function isCouncilPoll(pathname: string): boolean {
  return pathname.includes("council");
}
