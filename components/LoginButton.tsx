'use client'

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import SignInForm from "./SignInForm"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button
        variant="outline"
        className="text-slate-200 hover:text-amber-500"
        onClick={() => signOut()}
      >
        Sign out
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-slate-200 hover:text-amber-500"
        >
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-transparent border-0 p-0">
        <SignInForm />
      </DialogContent>
    </Dialog>
  )
}
