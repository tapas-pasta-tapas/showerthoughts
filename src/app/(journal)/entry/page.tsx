"use client";
import { Button } from "@/components/ui/button";
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

    const contents = messages.map((message) => ({
      sender: message.role === "user" ? Sender.USER : Sender.BOT,
      content: message.parts.map((part) => part.text).join(" "),
    }));

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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative">
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 relative">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Entry</h1>
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
