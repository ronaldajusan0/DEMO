import type { ReactNode } from "react";

export const metadata = {
  title: "BookIt",
  description: "Book appointments with providers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
