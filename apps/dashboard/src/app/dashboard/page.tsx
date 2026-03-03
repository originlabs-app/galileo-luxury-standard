"use client";

import Link from "next/link";
import {
  Package,
  Shield,
  ArrowRightLeft,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  { label: "Total Products", value: 0, icon: Package },
  { label: "Active Passports", value: 0, icon: Shield },
  { label: "Pending Transfers", value: 0, icon: ArrowRightLeft },
  { label: "Verifications", value: 0, icon: CheckCircle },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName = user?.email ?? "there";

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome message */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your Galileo Protocol activity.
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
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/products">Create your first product</Link>
        </Button>
      </div>
    </div>
  );
}
