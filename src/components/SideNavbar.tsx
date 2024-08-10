"use client";

import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { JOURNALS, ROOT } from "../lib/routes";
import {
  Bell,
  Home,
  Package2,
  Users,
  Book,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
type Props = {};

const AuthButton = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center">
        {session?.user?.name}
        <br />
        <button
          onClick={() => signOut()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded items-center"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      Not signed in
      <br />
      <button
        onClick={() => signIn()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded items-center"
      >
        Sign in
      </button>
    </div>
  );
};

const NavbarButtons = [
  {
    icon: <Home className="h-4 w-4" />,
    title: "Home",
    href: "#",
  },
  {
    icon:  <Book className="h-4 w-4" />,
    title: "Entries",
    href: JOURNALS,
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "Friends",
    href: "#",
  },
  {
    icon:  <Calendar className="h-4 w-4" />,
    title: "Calendar",
    href: "#",
  },
];

const SideNavbar = (props: Props) => {
  return (
    <div className="flex flex-col max-w-[268px] justify-between border-r-gray-300 h-screen box-border border-r bg-muted/40">
      <div className="hidden border-r bg-muted/40 md:block justify-between">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={ROOT} className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">ShowerThoughts</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 mt-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {
                NavbarButtons.map((button) => (
                  <Link
                    key={button.title}
                    href={button.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  >
                    {button.icon}
                    {button.title}
                  </Link>
                ))
              }
            </nav>
          </div>
        </div>
        <AuthButton />
      </div>
    </div>
  );
};

export default SideNavbar;
