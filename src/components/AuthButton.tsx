"use client";

import React from "react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

type AuthButtonProps = {
  session: Session | null;
};

const AuthButton = ({ session }: AuthButtonProps) => {
  if (session) {
    return (
      <div className="box-border flex w-full flex-col items-center p-4">
        {session?.user?.name}
        <br />
        <button
          onClick={() => signOut()}
          className="items-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="box-border flex w-full flex-col items-center p-4">
      Not signed in
      <br />
      <button
        onClick={() => signIn()}
        className="items-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Sign in
      </button>
    </div>
  );
};

export default AuthButton;
