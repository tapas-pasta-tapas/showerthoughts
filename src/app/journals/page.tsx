"use client";
import { JournalEntry, Sender, TextObject } from "@/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";

type Props = {};

const page = (props: Props) => {
  const { status } = useSession();
  const [journals, setJournals] = useState<JournalEntry[] | null>(null);

  const fetchJournals = () => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        setJournals(data.data);
      });
  };

  const handleSubmit = async () => {
    const contents: TextObject[] = [
      {
        id: "1",
        sender: Sender.USER,
        content: "This is a journal entry from the user.",
        JournalEntry: null,
        journalEntryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        sender: Sender.BOT,
        content: "This is a journal",
        JournalEntry: null,
        journalEntryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        sender: Sender.USER,
        content: "This is a user reply.",
        JournalEntry: null,
        journalEntryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "My journal", contents: contents }),
    });
    fetchJournals();
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/journal/${id}`, {
      method: "DELETE",
    });

    fetchJournals();
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full box-border p-8 space-y-4">
      <h1 className="h1">Journals</h1>
      <div className="flex flex-col space-y-4 w-full">
        {journals &&
          journals.map((journal) => (
            <div
              key={journal.id}
              className="flex space-x-4 border border-gray-300 rounded-sm p-4 box-border shadow-md hover:cursor-pointer"
            >
              <Link
                className="flex flex-grow flex-col"
                href={`/entry/${journal.id}`}
              >
                <h1 className="h2">{journal.title}</h1>
                <span className="text-text-primary">
                  Content: {journal.contents[0] && journal.contents[0].content}
                </span>
              </Link>
              <button
                onClick={() => {
                  handleDelete(journal.id);
                }}
              >
                <Trash2 />
              </button>
            </div>
          ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default page;
