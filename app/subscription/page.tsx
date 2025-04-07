'use client';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { subscriptionPlans } from '@/src/schema';
import { TIER_LIMITS } from '@/src/utils/subscription';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Zap, Shield, Crown } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SubscriptionPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    redirect('/');
  }

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

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
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 text-amber-500 border-amber-500/20"
          >
            Choose Your Plan
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6 tracking-tight">
            Unlock{" "}
            <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
              Premium Features
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Select the perfect plan to enhance your QR code styling capabilities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(TIER_LIMITS).map(([tier, limits]) => (
            <Card
              key={tier}
              className={`bg-slate-900/50 border-slate-800 hover:border-amber-500/50 transition-all duration-300 ${
                tier === 'BASIC' ? 'md:scale-105' : ''
              }`}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-50">
                    {tier.charAt(0) + tier.slice(1).toLowerCase()}
                  </h2>
                  {tier === 'PREMIUM' && (
                    <Badge className="bg-amber-500 text-slate-900">
                      Most Popular
                    </Badge>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-50">
                    ${tier === 'FREE' ? '0' : tier === 'BASIC' ? '9.99' : '19.99'}
                  </span>
                  <span className="text-slate-400">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-300">
                    <Zap className="h-5 w-5 text-amber-500 mr-2" />
                    {limits.maxMonthlyGenerations} images/month
                  </li>
                  <li className="flex items-center text-slate-300">
                    <Shield className="h-5 w-5 text-amber-500 mr-2" />
                    Up to {limits.maxWidth}x{limits.maxHeight}
                  </li>
                  {limits.queuePriority > 0 && (
                    <li className="flex items-center text-slate-300">
                      <Crown className="h-5 w-5 text-amber-500 mr-2" />
                      Priority Processing
                    </li>
                  )}
                  {Object.entries(limits.features).map(([feature, value]) => (
                    <li
                      key={feature}
                      className="flex items-center text-slate-300"
                    >
                      <Shield className="h-5 w-5 text-amber-500 mr-2" />
                      {feature.split(/(?=[A-Z])/).join(' ')}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900"
                  onClick={() => handleSubscribe(tier)}
                >
                  {tier === 'FREE' ? 'Get Started' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-amber-500" />
              <span className="text-slate-400">
                © 2024 QR Styler. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-slate-400 hover:text-amber-500 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-amber-500 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-amber-500 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
