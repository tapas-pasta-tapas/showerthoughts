import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";

import SessionProvider from "../components/providers/SessionProvider";
import SideNavbar from "../components/SideNavbar";
import { authOptions } from "@/lib/auth";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShowerThoughts",
  description: "AI Journalling platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <main className="flex min-h-screen items-center">
            <SideNavbar />
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
