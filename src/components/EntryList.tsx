"use client";
import { JournalEntry } from "@/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ENTRY } from "@/lib/routes";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

type Props = {};

const EntryList = (props: Props) => {
  const { status } = useSession();
  const { id } = useParams();

  const [journals, setJournals] = useState<JournalEntry[] | null>(null);

  const fetchJournals = () => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        setJournals(data.data);
      });
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/journal/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      console.error("Failed to delete journal entry");
    }

    fetchJournals();
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="box-border flex w-full flex-col space-y-2 p-4">
      <Link href={ENTRY}>
        <Button className="w-full">
          <Plus />
          Add Entry
        </Button>
      </Link>
      {journals &&
        journals.map((journal) => (
          <div
            key={journal.id}
            className={`box-border flex w-full justify-between space-x-1 rounded-lg border border-gray-300 p-4 shadow-md hover:cursor-pointer hover:bg-slate-100 ${id === journal.id && "bg-slate-100"}`}
          >
            <Link
              className="text-text-primary max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              href={`/entry/${journal.id}`}
            >
              {journal.title}
            </Link>
            <button
              onClick={() => {
                handleDelete(journal.id);
              }}
              className={`${id === journal.id ? "block" : "hidden"}`}
            >
              <Trash2 className="h-4 w-4 text-slate-700 hover:font-bold hover:text-slate-900" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default EntryList;
