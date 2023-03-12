import { signIn as signInReact } from "next-auth/react";

export const signIn = () => {
  signInReact("google", { callbackUrl: "/dashboard" });
};
