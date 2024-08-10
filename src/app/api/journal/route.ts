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

    const json = await req.json();

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
 * Deletes a journal entry by id, after checking if that id belongs to the user
 * 400: journal entry id is required
 * 401: unauthorized or no user found
 * 404: journal entry not found or does not belong to the user
 * 500: Internal server error
 * 200: { message: "success: journal entry deleted", data: JournalEntry }
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const journalEntryId = url.searchParams.get("id");

    if (!journalEntryId) {
      return new NextResponse(
        JSON.stringify({ message: "error: journal entry id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse(
        JSON.stringify({ message: "error: unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userId = session.user.id;

    // Check if the JournalEntry exists and is associated with the user
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id: journalEntryId,
        userId: userId, // Ensure the JournalEntry belongs to the specified user
      },
    });

    if (!journalEntry) {
      return new NextResponse(
        JSON.stringify({
          message:
            "error: journal entry not found or does not belong to the user",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Proceed with deletion if the JournalEntry exists and is associated with the user
    const deletedJournalEntry = await prisma.journalEntry.delete({
      where: {
        id: journalEntryId,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "success: journal entry deleted",
        data: deletedJournalEntry,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "error: failed to delete journal entry" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
