import type { Metadata, Viewport } from "next";
import "@/styles/tailwind.css";
import "@/styles/frontend.css";
import clsx from "clsx";
import styles from "@/app/(frontend)/(unprotected)/privacy-policy/page.module.scss";
import Link from "next/link";
import { Logo } from "@/components/Logo";

// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "viewpoints.xyz",
  description: "what in the world are you thinking?",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Default export
// -----------------------------------------------------------------------------

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <div className="self-start flex items-center justify-end w-full p-4 sticky top-0 bg-zinc-900 z-[60] min-h-[68px]">
      <div className={clsx(styles.logo, "mr-auto")}>
        <Link href="/" className="hover:opacity-50 text-white">
          <Logo width={160} height={40} />
        </Link>
      </div>
    </div>
    {children}
  </>
);

export default RootLayout;
