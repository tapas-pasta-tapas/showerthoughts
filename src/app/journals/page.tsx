"use client";
import { JournalEntry, Sender, TextObject } from "@/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type Props = {};

const page = (props: Props) => {
  const { status } = useSession();
  const [journals, setJournals] = useState<JournalEntry[] | null>(null);
  useEffect(() => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setJournals(data.data);
      });
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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

    console.log("response", response);
  };

  return (
    <div className="flex flex-col min-h-screen box-border p-8 space-y-4">
      <h1 className="font-semibold text-lg">Journals</h1>
      <div className="border border-gray-300 rounded-sm p-4 box-border w-full">
        {journals &&
          journals.map((journal) => (
            <div key={journal.id}>
              <h1>Title: {journal.title}</h1>
              <span>
                Content: {journal.contents[0] && journal.contents[0].content}
              </span>
            </div>
          ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default page;
