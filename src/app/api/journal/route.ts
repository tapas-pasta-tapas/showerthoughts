import prisma from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import { getSession } from "next-auth/react";

export async function GET(req: NextRequest, res: NextResponse) {
  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session || !session.user) {
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

  const email = session.user.email;

  if (!email) {
    console.log("error: user email not found");
    return new NextResponse(
      JSON.stringify({ message: "error: user email not found" }),
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
        email: email,
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
