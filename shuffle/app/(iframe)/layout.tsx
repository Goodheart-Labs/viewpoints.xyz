import "@/styles/tailwind.css";

export const metadata = {
  title: "viewpoints.xyz",
  description: "embedded in an iframe!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="p-4">{children}</div>
      </body>
    </html>
  );
}
