'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, XCircle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <QrCode className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-amber-500 bg-clip-text text-transparent">
              QR Styler
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-lg mx-auto bg-slate-900/50 border-slate-800">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="h-16 w-16 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-50 mb-4">
              Subscription Cancelled
            </h1>
            <p className="text-slate-400 mb-8">
              Your subscription process was cancelled. You can still use our free tier or try subscribing again when you&apos;re ready.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                onClick={() => router.push('/subscription')}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
