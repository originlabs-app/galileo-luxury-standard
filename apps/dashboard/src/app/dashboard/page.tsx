"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Shield,
  ArrowRightLeft,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsResponse {
  success: true;
  data: {
    byStatus: Record<string, number>;
    verificationCount: number;
    recentEvents: Array<{
      id: string;
      type: string;
      createdAt: string;
      product: {
        name: string;
        gtin: string;
      };
    }>;
    trends?: {
      productsCreated: number[];
      verifications: number[];
    };
  };
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2 || data.every((v) => v === 0)) return null;

  const max = Math.max(...data, 1);
  const W = 64;
  const H = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible opacity-70"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: "Product created",
  UPDATED: "Product updated",
  MINTED: "Passport minted",
  TRANSFERRED: "Product transferred",
  VERIFIED: "Product verified",
  RECALLED: "Product recalled",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [verificationCount, setVerificationCount] = useState(0);
  const [recentEvents, setRecentEvents] = useState<
    StatsResponse["data"]["recentEvents"]
  >([]);
  const [trends, setTrends] = useState<StatsResponse["data"]["trends"]>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<StatsResponse>("/products/stats");
      setByStatus(res.data.byStatus);
      setVerificationCount(res.data.verificationCount);
      setRecentEvents(res.data.recentEvents);
      setTrends(res.data.trends);
    } catch (err) {
      // Silently fail -- show zeros if stats unavailable
      if (!(err instanceof ApiError)) {
        console.error("Failed to load stats", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const displayName = user?.email ?? "there";
  const activeBrandName = user?.brand?.name ?? "pilot workspace";

  const totalProducts =
    (byStatus.DRAFT ?? 0) +
    (byStatus.ACTIVE ?? 0) +
    (byStatus.TRANSFERRED ?? 0) +
    (byStatus.RECALLED ?? 0) +
    (byStatus.MINTING ?? 0);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      trend: trends?.productsCreated,
    },
    {
      label: "Active Passports",
      value: byStatus.ACTIVE ?? 0,
      icon: Shield,
      trend: undefined,
    },
    {
      label: "Transferred",
      value: byStatus.TRANSFERRED ?? 0,
      icon: ArrowRightLeft,
      trend: undefined,
    },
    {
      label: "Verifications",
      value: verificationCount,
      icon: CheckCircle,
      trend: trends?.verifications,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome message */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeBrandName} is live as your active pilot workspace for this session.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "\u2014" : stat.value}
                </p>
                {!isLoading && stat.trend && (
                  <div className="text-primary">
                    <Sparkline data={stat.trend} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recentEvents.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {EVENT_LABELS[event.type] ?? event.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.product.name} ({event.product.gtin})
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/products">
            {totalProducts > 0 ? "View products" : "Create your first product"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
