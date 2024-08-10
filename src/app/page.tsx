import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

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
          <div className="flex flex-col items-center gap-1 text-center p-4 box-border">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no journal entries.
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a journal entry now!.
            </p>

            <Link href="/entry">
              <Button className="mt-4">Add Entry</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
