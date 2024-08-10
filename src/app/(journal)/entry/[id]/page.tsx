"use client";
import { TextObject } from "@/types";
import React, { useEffect, useState } from "react";

const EntryPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const [contents, setContents] = useState<TextObject[]>([]);

  const fetchEntry = () => {
    fetch(`/api/journal/${id}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setContents(data.data.contents);
      });
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  return (
    <div className="page-col p-8 space-y-4">
      <h1 className="h1">Entry</h1>
      <div>
        {contents &&
          contents.map((content) => <p key={content.id}>{content.content}</p>)}
      </div>
    </div>
  );
};

export default EntryPage;
