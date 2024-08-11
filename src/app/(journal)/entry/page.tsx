"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sender } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const JournalPage = () => {
  const router = useRouter();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResponseText(""); // Clear previous response

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Failed to save the entry");
      }

      const data = response.body;

      if (!data) {
        return;
      }

      setLoading(false);
      setStreaming(true);

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        setResponseText((prev) => prev + chunkValue);
      }

      setStreaming(false);
    } catch (error) {
      console.error("Failed to save the entry:", error);
    }
  };

  const handleSave = async () => {
    if (text === "") {
      console.error("Text is empty");
      return;
    }

    setLoading(true);

    const contents = [
      {
        sender: Sender.USER,
        content: text,
      },
      {
        sender: Sender.BOT,
        content: responseText,
      },
    ];

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "My journal", contents: contents }),
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Failed to save the entry");
      }
      setLoading(false);

      router.push("/journals");
    } catch (error) {
      console.error("Failed to save the entry:", error);
    }
  };

  return (
    <div className="min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
        <div className="flex items-center">
          <h1 className="h1">Entry</h1>
        </div>
        <Textarea value={text} onChange={handleTextChange}></Textarea>
        {streaming && (
          <div className="mt-4 text-gray-600">Streaming response...</div>
        )}
        {responseText && (
          <div className="mt-4 rounded-md bg-gray-100 p-4">{responseText}</div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            className="flex flex-grow"
            onClick={handleGenerate}
            disabled={loading || streaming}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
          <Button
            className="flex flex-grow bg-blue-500"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default JournalPage;
