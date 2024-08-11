import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import EntryList from "./EntryList";
import { ROOT } from "@/lib/routes";
import AuthButton from "./AuthButton";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

const SideNavbarMobile = async () => {
  const session = await getServerSession(authOptions);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex h-screen w-full max-w-[300px] flex-col justify-between"
      >
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href={ROOT}
            className="flex items-center gap-2 text-lg font-semibold"
          >
            ShowerThoughts
          </Link>
          <EntryList />
        </nav>
        <AuthButton session={session} />
      </SheetContent>
    </Sheet>
  );
};

export default SideNavbarMobile;
