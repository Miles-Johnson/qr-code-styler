'use client'

import { useSession } from "next-auth/react"
import SignInForm from "./SignInForm"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="text-center p-8">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <SignInForm />
  }

  return <>{children}</>
}
