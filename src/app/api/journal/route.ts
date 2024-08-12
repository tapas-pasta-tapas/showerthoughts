import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/db";
import { CreateJournalEntryRequest, GeminiMessage } from "@/types";

/**
 * Fetch all of the user's journal entries
 * 401: session not found or user not found
 * 500: Internal server error
 * 200: { data: JournalEntry[] }
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "error: Session not found" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = session.user?.id;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ message: "error: user id not found" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        User: {
          id: userId,
        },
      },
      include: {
        User: true, // Include user data if necessary
        messages: true, // Include the conversation history
      },
      orderBy: {
        createdAt: 'desc', // Optional: order by creation date
      },
    });

    // Transforming the data to include the full journal content and conversation history
    const transformedEntries = journalEntries.map(entry => ({
      id: entry.id,
      title: entry.title,
      content: entry.content, // The full journal content
      messages: entry.messages, // The conversation history
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    return new NextResponse(JSON.stringify({ data: transformedEntries }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "error: Internal server error" + error }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
/**
 * Takes in a body JSON a type of CreateJournalEntryRequest and will return the created journal entry id
 * 400: title or contents params not found, or contents array is empty
 * 401: session not found or user not found
 * 500: Internal server error
 * 201: Successfully created with returns { journalEntryId: string }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "error: Session not found" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = session.user?.id;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ message: "error: user id not found" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "error: user not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const json = await req.json();
    const { title, content, messages } = json as {
      title: string;
      content: string;
      messages: GeminiMessage[];
    };

    if (!title || !content) {
      return new NextResponse(
        JSON.stringify({ message: "error: title or content not found" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Creating Journal Entry with:", { title, content, messages }); // Debugging line

    const journalEntry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        User: { connect: { id: userId } },
        messages: {
          create: messages.map((message) => ({
            role: message.role,
            parts: JSON.stringify(message.parts), // Storing parts as a JSON string
          })),
        },
      },
      include: {
        messages: true,
      },
    });

    return new NextResponse(
      JSON.stringify({ journalEntryId: journalEntry.id }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to create journal entry:", error); // Improved error logging
    return new NextResponse(
      JSON.stringify({ message: `error: Internal server error - ${(error as Error).message}` }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}