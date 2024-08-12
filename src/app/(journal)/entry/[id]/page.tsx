"use client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const EditJournalPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [journalTitle, setJournalTitle] = useState<string>("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>(""); // State for the response text
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus(); // Set focus to the textarea when the component mounts
    }

    // Fetch the existing journal entry content
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/journal/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch the journal entry");
        }

        const data = await response.json();
        setJournalTitle(data.data.title || ""); // Set the journal title
        setText(data.data.content || ""); // Assuming content is a string
      } catch (error) {
        console.error("Failed to fetch the journal entry:", error);
      }
    };

    fetchEntry();
  }, [id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setResponseText(""); // Clear response text when user starts typing

    // Clear previous debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new debounce timeout
    debounceTimeout.current = setTimeout(() => {
      handleSave(); // Save changes after a period of inactivity
      handleGenerate(); // Generate AI response
    }, 3000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 50) return;
    setJournalTitle(e.target.value);

    // Clear previous debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new debounce timeout
    debounceTimeout.current = setTimeout(() => {
      handleSave(); // Save changes after a period of inactivity
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && !loading && responseText) {
      e.preventDefault();
      setText((prev) => prev + responseText); // Append the response text to the user's input
      setResponseText(""); // Clear the response text after appending
    }
  };

  const handleGenerate = async () => {
    if (text.trim() === "") return;

    setLoading(true);

    // Trim the text to the last 400 characters or less
    const trimmedText = text.slice(-400);

    const newMessage = {
      role: "user",
      parts: [{ text: trimmedText }],
    };

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [newMessage] }),
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Failed to generate the response");
      }

      setLoading(false);
      setStreaming(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let systemResponse = "";

      while (!done && reader) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        systemResponse += decoder.decode(value, { stream: true });
      }

      setResponseText(systemResponse); // Update responseText with the bot's response
      setStreaming(false);
    } catch (error) {
      console.error("Failed to generate the response:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (text.trim() === "" && journalTitle.trim() === "") return;

    setLoading(true);

    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: journalTitle, content: text }), // Save the current text content and title
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error("Failed to save the journal entry");
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to save the journal entry:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative">
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 relative">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Entry</h1>
        </div>
        <div className="flex flex-col space-y-2">
          <Input
            placeholder="Journal title"
            value={journalTitle}
            onChange={handleTitleChange}
          />
          <span className="text-sm text-gray-400">
            {journalTitle.length}/50
          </span>
        </div>
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="relative z-10 bg-transparent min-h-96 resize-none border-transparent border-none outline-none"
            style={{ color: "black" }}
          />
          <div
            className="absolute text-md top-2 left-0 pointer-events-none z-0 whitespace-pre-wrap"
            style={{ color: "transparent" }}
          >
            {text}
            {loading && <span className="text-gray-400">⌛</span>}
            <span className="text-gray-400">{responseText}</span> {/* Display the response text */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditJournalPage;
