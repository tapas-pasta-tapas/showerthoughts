import React from "react";
import Link from "next/link";
import { ROOT } from "../lib/routes";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import EntryList from "./EntryList";

type Props = {};

const SideNavbar = async (props: Props) => {
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
    </div>
  );
};

export default SideNavbar;
