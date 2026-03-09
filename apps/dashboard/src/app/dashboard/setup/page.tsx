"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { evaluateWorkspaceAccess } from "@/lib/workspace-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusCards = [
  {
    key: "role",
    title: "Role",
    icon: UserRound,
  },
  {
    key: "brand",
    title: "Active brand",
    icon: Building2,
  },
  {
    key: "access",
    title: "Workspace access",
    icon: ShieldCheck,
  },
  {
    key: "wallet",
    title: "Wallet readiness",
    icon: Wallet,
  },
] as const;

export default function DashboardSetupPage() {
  const { user } = useAuth();
  const access = evaluateWorkspaceAccess(user);
  const hasBlockingItems = access.blockingItems.length > 0;

  const statusValues = {
    role: access.roleSummary,
    brand: access.activeBrandName,
    access: access.readinessLabel,
    wallet: user?.walletAddress ? "Linked" : "Optional",
  } as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant={hasBlockingItems ? "destructive" : "secondary"}>
            {access.readinessLabel}
          </Badge>
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Access readiness
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Review your active role, brand assignment, and workspace eligibility
              before entering the mono-brand pilot dashboard.
            </p>
          </div>
        </div>
        {access.isEligible ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Continue to dashboard</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {statusValues[card.key]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4" />
              Blocking access issues
            </CardTitle>
            <CardDescription>
              These items prevent entry into the pilot workspace until the account is
              updated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasBlockingItems ? (
              <ul className="space-y-4">
                {access.blockingItems.map((item) => (
                  <li key={item.title} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="font-medium text-foreground">No blockers</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your account is approved for the current pilot workspace.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="size-4" />
              Operational hints
            </CardTitle>
            <CardDescription>
              Informational readiness signals that help orient the operator without
              blocking access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {access.infoItems.map((item) => (
                <li key={item.title} className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
