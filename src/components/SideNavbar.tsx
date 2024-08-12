import React from "react";
import Link from "next/link";
import { ENTRY, JOURNALS, ROOT } from "../lib/routes";
import { Bell, Home, Users, Book, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import AuthButton from "./AuthButton";
import EntryList from "./EntryList";

type Props = {};

const SideNavbar = async (props: Props) => {
  const session = await getServerSession(authOptions);

  return (
    <div className="box-border hidden h-screen max-w-[200px] flex-col justify-between border-r border-r-gray-300 bg-muted/40 md:flex">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-14 items-center space-x-2 border-b px-4 lg:h-[60px]">
          <Link href={ROOT} className="flex items-center gap-2 font-semibold">
            ShowerThoughts
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <EntryList />
        </div>
      </div>
      <AuthButton session={session} />
    </div>
  );
};

export default SideNavbar;
