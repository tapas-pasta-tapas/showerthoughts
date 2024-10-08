import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";
import { RequestError } from "@/types/error";
import NewRequestError from "@/lib/error";

/**
 * Fetches a journal entry by id
 * 400: journal entry id not provided
 * 401: unauthorized or no user found
 * 404: journal entry not found
 * 500: Internal server error
 * 200: { data: JournalEntry }
 * @param param1 id of the journal entry to fetch
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const journalEntryId = params.id;

    if (!journalEntryId) {
      return NextResponse.json(
        { message: "error: journal entry id is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "error: unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id: journalEntryId,
        userId: userId,
      },
      include: {
        messages: true, // Assuming you want to include messages or any other relations here
      },
    });

    if (!journalEntry) {
      return NextResponse.json(
        { message: "error: journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: journalEntry }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching journal entry:", error);
    return NewRequestError(error);
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const journalEntryId = id as string;

    if (!journalEntryId) {
      throw new RequestError(
        "error: journal entry id is required",
        400,
        "application/json"
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      throw new RequestError("error: unauthorized", 401, "application/json");
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
      throw new RequestError(
        "error: journal entry not found or does not belong to the user",
        404,
        "application/json"
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
    return NewRequestError(error);
  }
}

/**
 * Updates a journal entry's content by id
 * 400: journal entry id or content not provided
 * 401: unauthorized or no user found
 * 404: journal entry not found
 * 500: Internal server error
 * 200: { message: "success: journal entry updated" }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const journalEntryId = params.id;

    if (!journalEntryId) {
      return NextResponse.json(
        { message: "error: journal entry id is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "error: unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const json = await req.json();
    const { content } = json as { content: string };

    if (!content) {
      return NextResponse.json(
        { message: "error: content is required" },
        { status: 400 }
      );
    }

    // Check if the journal entry exists and belongs to the user
    const existingJournalEntry = await prisma.journalEntry.findFirst({
      where: {
        id: journalEntryId,
        userId: userId,
      },
    });

    if (!existingJournalEntry) {
      return NextResponse.json(
        { message: "error: journal entry not found" },
        { status: 404 }
      );
    }

    // Update the journal entry content
    await prisma.journalEntry.update({
      where: { id: journalEntryId },
      data: { content },
    });

    return NextResponse.json(
      { message: "success: journal entry updated" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json(
      { message: "error: Internal server error" },
      { status: 500 }
    );
  }
}