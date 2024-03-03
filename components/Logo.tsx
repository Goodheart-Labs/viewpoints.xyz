import Image from "next/image";

export const Logo = ({ width, height }: { width: number; height: number }) => {
  if (process.env.NEXT_PUBLIC_VIEWPOINTS_LOGO === "false") {
    return <span />;
  }
  return (
    <>
      <div className="dark:hidden">
        <Image
          className="max-w-[160px] sm:max-w-none"
          src="/logo.png"
          alt="viewpoints.xyz"
          width={width}
          height={height}
        />
      </div>
      <div className="hidden dark:block">
        <Image
          className="max-w-[160px] sm:max-w-none"
          src="/logo-dark.png"
          alt="viewpoints.xyz"
          width={width}
          height={height}
        />
      </div>
    </>
  );
};
