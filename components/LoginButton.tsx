'use client'

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import SignInForm from "./SignInForm"

export default function LoginButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="text-slate-900 hover:text-amber-500 bg-white hover:bg-white/90 gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{session.user?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
          <DropdownMenuItem
            className="text-slate-200 focus:text-amber-500 focus:bg-slate-800 cursor-pointer"
            onClick={() => signOut()}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-slate-900 hover:text-amber-500 bg-white hover:bg-white/90"
        >
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-transparent border-0 p-0">
        <DialogTitle className="sr-only">Sign in</DialogTitle>
        <DialogDescription className="sr-only">
          Sign in to your account to create QR codes
        </DialogDescription>
        <SignInForm />
      </DialogContent>
    </Dialog>
  )
}
