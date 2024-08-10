"use client";
import { JournalEntry } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type Props = {};

const page = (props: Props) => {
  const { status } = useSession();
  const [journals, setJournals] = useState<JournalEntry[] | null>(null);
  useEffect(() => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => setJournals(data.data));
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Journals</h1>
      {journals &&
        journals.map((journal) => (
          <div key={journal.id}>
            <h1>{journal.title}</h1>
          </div>
        ))}
    </div>
  );
};

export default page;
