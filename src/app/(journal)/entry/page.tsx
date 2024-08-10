"use client"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const JournalPage = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }

  const handleSave = async () => {
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
      // router.push("/");
    } catch (error) {
      console.error("Failed to save the entry:", error);
    }
  }
  
  return (
    <div className="min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Entry</h1>
        </div>
        <Textarea value={text} onChange={handleTextChange}></Textarea>
        {loading && <div className="mt-4 text-gray-600">Loading...</div>}
        {streaming && <div className="mt-4 text-gray-600">Streaming response...</div>}
        {responseText && <div className="mt-4 p-4 bg-gray-100 rounded-md">{responseText}</div>}
        <Button onClick={handleSave} disabled={loading || streaming}>
            {loading ? "Saving..." : "Save"}
        </Button>
      </main>
    </div>
  );
};

export default JournalPage;
