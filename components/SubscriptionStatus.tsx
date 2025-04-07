'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface SubscriptionInfo {
  tier: string;
  monthlyGenerationCount: number;
  limits: {
    maxMonthlyGenerations: number;
    maxWidth: number;
    maxHeight: number;
  };
  expiresAt: string | null;
}

export function SubscriptionStatus() {
  const { data: session } = useSession();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription info');
        }
        const data = await response.json();
        setSubscriptionInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSubscriptionInfo();
    }
  }, [session]);

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <p className="text-slate-400">Loading subscription info...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo) {
    return null;
  }

  const usagePercentage = (subscriptionInfo.monthlyGenerationCount / subscriptionInfo.limits.maxMonthlyGenerations) * 100;
  const remaining = subscriptionInfo.limits.maxMonthlyGenerations - subscriptionInfo.monthlyGenerationCount;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-200">
              {subscriptionInfo.tier.charAt(0).toUpperCase() + subscriptionInfo.tier.slice(1)} Plan
            </h3>
          </div>
          {subscriptionInfo.tier === 'free' && (
            <Link href="/subscription">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              >
                Upgrade
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Monthly Generations</span>
              <span>{remaining} remaining</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div className="flex justify-between text-sm text-slate-400">
            <span>Max Resolution</span>
            <span>{subscriptionInfo.limits.maxWidth}x{subscriptionInfo.limits.maxHeight}</span>
          </div>

          {subscriptionInfo.expiresAt && (
            <div className="flex justify-between text-sm text-slate-400">
              <span>Renews</span>
              <span>{new Date(subscriptionInfo.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
