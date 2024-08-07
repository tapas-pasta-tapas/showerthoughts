import { NextResponse } from "next/server";
import prisma from "@/db";

export async function GET() {
  const journals = await prisma.journalEntry.findMany();

  return new NextResponse(JSON.stringify({ data: journals }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
