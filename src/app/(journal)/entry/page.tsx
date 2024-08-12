"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sender, GeminiMessage } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const JournalPage = () => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [responseText, setResponseText] = useState<string>(""); // State for the response text
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus(); // Set focus to the textarea when the component mounts
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setResponseText(""); // Clear response text when user starts typing

    // Clear previous debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new debounce timeout
    debounceTimeout.current = setTimeout(() => {
      handleGenerate(); // Call the function to generate AI response after 3 seconds of inactivity
    }, 3000);
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

    const newMessage: GeminiMessage = {
      role: "user",
      parts: [{ text: trimmedText }],
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
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

      const botMessage: GeminiMessage = {
        role: "model",
        parts: [{ text: systemResponse }],
      };

      setMessages((prev) => [...prev, botMessage]);
      setStreaming(false);
    } catch (error) {
      console.error("Failed to generate the response:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (text === "" && messages.length === 0) {
      console.error("No content to save");
      return;
    }

    setLoading(true);

    const journalEntry = {
      title: journalTitle === "" ? "My Journal" : journalTitle, // Can be dynamically set based on user input
      content: text, // Store the entire journal entry text
      messages: messages, // Store the conversation history
    };

    console.log("Saving Journal Entry:", journalEntry); // Debugging line

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalEntry),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get error details from the server
        setLoading(false);
        console.error("Failed to save the entry:", errorText);
        throw new Error(`Failed to save the entry: ${errorText}`);
      }

      setLoading(false);
      router.push("/journals");
    } catch (error) {
      console.error("Failed to save the entry:", error);
      setLoading(false);
    }
  };

  // Auto-save whenever the user stops typing for a set duration
  useEffect(() => {
    if (text.trim() !== "") {
      handleSave();
    }
  }, [text]); // Save when `text` changes

  return (
    <div className="relative min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <main className="relative flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Entry</h1>
        </div>
        <div className="flex flex-col space-y-2">
          <Input
            placeholder="Journal title"
            value={journalTitle}
            onChange={(e) => {
              if (e.target.value.length > 50) return;
              setJournalTitle(e.target.value);
            }}
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
            className="relative z-10 min-h-96 resize-none border-none border-transparent bg-transparent outline-none"
            style={{ color: "black" }}
          />
          <div
            className="text-md pointer-events-none absolute left-0 top-2 z-0 whitespace-pre-wrap"
            style={{ color: "transparent" }}
          >
            {text}
            {loading && <span className="text-gray-400">⌛</span>}
            <span className="text-gray-400">{responseText}</span>{" "}
            {/* Display the response text */}
          </div>
        </div>
        {/* <div className="flex justify-end">
          <Button className="w-full md:w-auto" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div> */}
      </main>
    </div>
  );
};

export default JournalPage;
