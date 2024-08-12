"use client";

import React from "react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

type AuthButtonProps = {
  session: Session | null;
};

const AuthButton = ({ session }: AuthButtonProps) => {
  if (session) {
    return (
      <Button
        className="bg-transparent p-2 text-slate-800 hover:bg-transparent"
        onClick={() => signOut()}
      >
        Logout
      </Button>
    );
  }
  return (
    <Button
      className="bg-transparent p-2 text-slate-800 hover:bg-transparent"
      onClick={() => signIn()}
    >
      Login
    </Button>
  );
};

export default AuthButton;
