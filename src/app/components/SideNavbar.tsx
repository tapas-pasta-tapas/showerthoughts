"use client";

import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { ROOT, PROTECTED } from "../../lib/routes";

type Props = {};

const AuthButton = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        {session?.user?.name}
        <br />
        <button
          onClick={() => signOut()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div>
      Not signed in
      <br />
      <button
        onClick={() => signIn()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign in
      </button>
    </div>
  );
};

const SideNavbar = (props: Props) => {
  return (
    <div className="flex flex-col justify-between max-w-[200px] border-r border-r-gray-300 h-screen box-border p-4">
      <div className="flex flex-col space-y-4">
        <Link href={ROOT} className="font-medium text-xl">ShowerThoughts</Link>
        <Link href={PROTECTED} className="hover:underline">Protected</Link>
      </div>
      <AuthButton />
    </div>
  );
};

export default SideNavbar;
