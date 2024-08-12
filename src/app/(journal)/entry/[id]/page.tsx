"use client";
import React, { useEffect, useState } from "react";

const EntryPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const [content, setContent] = useState<string>("");

  const fetchEntry = async () => {
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch the journal entry");
      }

      const data = await res.json();
      setContent(data.data.content); // Assuming content is a string
    } catch (error) {
      console.error("Error fetching entry:", error);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [id]);

  return (
    <div className="page-col space-y-4 p-8">
      <h1 className="h1">Entry</h1>
      <div>
        <p>{content}</p> {/* Display the full journal entry content */}
      </div>
    </div>
  );
};

export default EntryPage;
