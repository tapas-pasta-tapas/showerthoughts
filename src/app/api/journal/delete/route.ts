import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/db";

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
    console.error(error);
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
