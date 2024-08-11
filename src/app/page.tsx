import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { ENTRY } from "@/lib/routes";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <div className="flex items-center">
          <h1 className="h1">Diary</h1>
        </div>
        <div
          className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
          x-chunk="dashboard-02-chunk-1"
        >
          <div className="box-border flex flex-col items-center gap-1 p-4 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no journal entries.
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a journal entry now!.
            </p>

            <Link href={ENTRY}>
              <Button className="w-full">
                <Plus />
                Add Entry
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
