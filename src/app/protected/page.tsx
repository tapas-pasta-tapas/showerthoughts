import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

// Nothing much to this page, just to test if authentication is working
export default async function ProtectedRoute() {
  return (
    <div>
      <h1>Protected Route, If you see this you are authenticated</h1>
    </div>
  );
}
