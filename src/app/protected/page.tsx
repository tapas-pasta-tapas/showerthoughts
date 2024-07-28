import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ProtectedRoute() {
  return (
    <div>
      <h1>Protected Route, If you see this you are authenticated</h1>
    </div>
  );
}
