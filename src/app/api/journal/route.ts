import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/db";
import { CreateJournalEntryRequest } from "@/types";

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
      console.log("error: Session not found");
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

    // Can ignore as we're mutating the session object to add the id
    const userId = session.user?.id;

    if (!userId) {
      console.log("error: user id not found");
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
        User: true,
        contents: true,
      },
    });

    return new NextResponse(JSON.stringify({ data: journalEntries }), {
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
export async function POST(req: Request, res: Response) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("error: Session not found");
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
      console.log("error: user id not found");
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

    const json = await req.json();
    console.log("inner", json);

    const { title, contents } = json as CreateJournalEntryRequest;

    if (!title || !contents || contents.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "error: title or contents not found" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const createContents = contents
      ? contents.map((content) => ({
          sender: content.sender,
          content: content.content,
        }))
      : [];

    const journalEntry = await prisma.journalEntry.create({
      data: {
        title,
        User: { connect: { id: userId } },
        contents: {
          create: createContents,
        },
      },
      include: {
        contents: true, // Include the associated text objects
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
    console.error("Internal Server Error:", error);
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
