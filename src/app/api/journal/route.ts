import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

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
  // @ts-ignore
  const userId = session.user?.id ?? null;

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
}
