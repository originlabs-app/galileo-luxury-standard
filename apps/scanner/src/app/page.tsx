import { validateGtin, generateDigitalLinkUrl } from "@galileo/shared";

type MaterialEntry = {
  name: string;
  percentage: number;
};

type BlockchainVerification = {
  verified: boolean;
  txHash: string;
  tokenId: string | null;
  chain: string;
  explorerUrl: string;
  onChainDID?: string | null;
  onChainGtin?: string | null;
  onChainSerial?: string | null;
  onChainCategory?: string | null;
  isDecommissioned?: boolean;
};

type ResolverResult = {
  "@id": string;
  name?: string;
  description?: string | null;
  category?: string | null;
  gtin?: string;
  serialNumber?: string;
  status?: string;
  brand?: {
    "@type"?: string;
    "@id"?: string;
    name?: string | null;
  } | null;
  passport?: {
    digitalLink?: string | null;
    txHash?: string | null;
    tokenAddress?: string | null;
    chainId?: number | null;
    mintedAt?: string | null;
  } | null;
  blockchain?: BlockchainVerification | null;
  hasMaterialComposition?: MaterialEntry[];
  provenance?: Array<{
    "@type"?: string;
    eventType?: string;
    timestamp?: string;
    description?: string;
  }>;
};

type ResolveState = {
  ok: boolean;
  status: number;
  data?: ResolverResult;
  error?: string;
  requestedUrl?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_RESOLVER_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

type NormalizeResult =
  | { ok: true; resolverPath: string; canonicalUrl: string }
  | { ok: false; error: string };

function normalizeResolverInput(input: string): NormalizeResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: "Enter a Digital Link URL or DID to look up a product." };
  }

  // DID format: did:galileo:01:{gtin}:21:{serial}
  const didMatch = /^did:galileo:01:(\d+):21:(.+)$/i.exec(trimmed);
  if (didMatch) {
    const [, gtin, serial] = didMatch;
    if (!gtin || gtin.length < 13 || gtin.length > 14) {
      return {
        ok: false,
        error: `DID GTIN must be 13 or 14 digits, got ${gtin?.length ?? 0}`,
      };
    }
    if (!validateGtin(gtin)) {
      return { ok: false, error: "DID GTIN check digit invalid" };
    }
    const encodedSerial = encodeURIComponent(serial!);
    return {
      ok: true,
      resolverPath: `/01/${gtin}/21/${encodedSerial}`,
      canonicalUrl: generateDigitalLinkUrl(gtin, serial!),
    };
  }

  // If it looks like a DID prefix but didn't match fully
  if (/^did:/i.test(trimmed)) {
    return {
      ok: false,
      error:
        'DID format not recognized — expected "did:galileo:01:{gtin}:21:{serial}"',
    };
  }

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/01\/(\d+)\/21\/([^/?#]+)/i);

    if (!match) {
      return {
        ok: false,
        error:
          'URL format not recognized — expected path "/01/{gtin}/21/{serial}"',
      };
    }

    const [, gtin, serialPart] = match;
    if (!gtin || gtin.length < 13 || gtin.length > 14) {
      return {
        ok: false,
        error: `URL GTIN must be 13 or 14 digits, got ${gtin?.length ?? 0}`,
      };
    }
    if (!validateGtin(gtin)) {
      return { ok: false, error: "URL GTIN check digit invalid" };
    }

    const serial = decodeURIComponent(serialPart!);
    const encodedSerial = encodeURIComponent(serial);

    return {
      ok: true,
      resolverPath: `/01/${gtin}/21/${encodedSerial}`,
      canonicalUrl: generateDigitalLinkUrl(gtin, serial),
    };
  } catch {
    return { ok: false, error: "URL format not recognized" };
  }
}

async function resolveLink(input: string): Promise<ResolveState> {
  const normalized = normalizeResolverInput(input);

  if (!normalized.ok) {
    return { ok: false, status: 400, error: normalized.error };
  }

  const response = await fetch(`${API_BASE_URL}${normalized.resolverPath}`, {
    headers: {
      Accept: "application/ld+json, application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : response.status === 404
          ? "Product not found in the public resolver."
          : "Unable to verify this digital link.";

    return {
      ok: false,
      status: response.status,
      error: message,
      requestedUrl: normalized.canonicalUrl,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: payload as ResolverResult,
    requestedUrl: normalized.canonicalUrl,
  };
}

function StatusPill({ status }: { status?: string }) {
  const normalized = status?.toLowerCase();

  const config =
    normalized === "active"
      ? {
          label: "Verified",
          className: "bg-success/15 text-success ring-success/25",
        }
      : normalized === "recalled"
        ? {
            label: "Recalled",
            className: "bg-primary/15 text-primary ring-primary/25",
          }
        : normalized === "draft"
          ? {
              label: "Draft",
              className: "bg-muted text-muted-foreground ring-border",
            }
          : {
              label: status ?? "Unknown",
              className: "bg-muted text-foreground ring-border",
            };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1 ${config.className}`}
    >
      {config.label}
    </span>
  );
}

const EVENT_LABELS: Record<string, string> = {
  CREATED: "Product registered",
  MINTED: "Passport minted",
  RECALLED: "Product recalled",
  TRANSFERRED: "Ownership transferred",
  VERIFIED: "Product verified",
};

function formatEventDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ProvenanceTimeline({
  events,
}: {
  events: NonNullable<ResolverResult["provenance"]>;
}) {
  if (events.length === 0) return null;

  return (
    <section className="mt-5 rounded-[28px] border border-border/80 bg-card p-5 shadow-xl shadow-black/20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Provenance Timeline
      </p>
      <div className="space-y-0">
        {events.map((event, index) => {
          const isRecalled = event.eventType === "RECALLED";
          const isLast = index === events.length - 1;
          const label =
            (event.eventType && EVENT_LABELS[event.eventType]) ??
            event.eventType ??
            "Event";

          return (
            <div
              key={`${event.eventType}-${event.timestamp}-${index}`}
              className="relative flex gap-3"
            >
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                    isRecalled
                      ? "border-primary bg-primary"
                      : "border-success bg-success"
                  }`}
                />
                {!isLast && <div className="w-px flex-1 bg-border/60" />}
              </div>

              {/* Content */}
              <div className={`${isLast ? "pb-0" : "pb-4"}`}>
                <p className="text-sm font-medium text-foreground">{label}</p>
                {event.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {formatEventDate(event.timestamp)}
                  </p>
                )}
                {event.description && (
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Reason: {String(event.description)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MaterialComposition({ materials }: { materials: MaterialEntry[] }) {
  if (materials.length === 0) return null;

  return (
    <section className="mt-5 rounded-[28px] border border-border/80 bg-card p-5 shadow-xl shadow-black/20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Material Composition
      </p>
      <div className="space-y-3">
        {materials.map((material) => (
          <div key={material.name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {material.name}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {material.percentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full bg-primary/70 transition-all"
                style={{ width: `${Math.min(material.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockchainBadge({
  blockchain,
}: {
  blockchain: BlockchainVerification | null | undefined;
}) {
  if (blockchain === undefined || blockchain === null) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <span className="text-sm text-muted-foreground">Not yet minted</span>
      </div>
    );
  }

  if (!blockchain.verified) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-500/15">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-400"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <span className="text-sm font-medium text-yellow-400">
          Blockchain mismatch
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success/5 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-sm font-medium text-success">
        Verified on blockchain
      </span>
    </div>
  );
}

function VerificationDetails({
  blockchain,
}: {
  blockchain: BlockchainVerification;
}) {
  const shortTx = `${blockchain.txHash.slice(0, 10)}…${blockchain.txHash.slice(-8)}`;
  const explorerBase = blockchain.tokenId
    ? blockchain.explorerUrl.replace(/\/tx\/0x[0-9a-fA-F]+$/, "")
    : null;

  return (
    <details className="group mt-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground select-none hover:text-foreground transition-colors">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-open:rotate-90"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Verification Details
      </summary>
      <dl className="mt-3 grid gap-2">
        <DetailRow
          label="Transaction"
          value={shortTx}
          mono
          href={blockchain.explorerUrl}
        />
        <DetailRow label="Chain" value={blockchain.chain} />
        {blockchain.tokenId ? (
          <DetailRow
            label="Token address"
            value={blockchain.tokenId}
            mono
            href={explorerBase ? `${explorerBase}/address/${blockchain.tokenId}` : null}
          />
        ) : null}
        {blockchain.isDecommissioned ? (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Decommissioned on-chain
            </p>
          </div>
        ) : null}
        {(blockchain.onChainDID ||
          blockchain.onChainGtin ||
          blockchain.onChainSerial ||
          blockchain.onChainCategory) ? (
          <div className="mt-1 border-t border-border/40 pt-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              On-chain data
            </p>
            <div className="grid gap-2">
              <DetailRow label="DID" value={blockchain.onChainDID} mono />
              <DetailRow label="GTIN" value={blockchain.onChainGtin} mono />
              <DetailRow label="Serial" value={blockchain.onChainSerial} mono />
              <DetailRow label="Category" value={blockchain.onChainCategory} />
            </div>
          </div>
        ) : null}
      </dl>
    </details>
  );
}

const CHAIN_NAMES: Record<number, string> = {
  8453: "Base",
  84532: "Base Sepolia",
};

const EXPLORER_URLS: Record<number, string> = {
  8453: "https://basescan.org",
  84532: "https://sepolia.basescan.org",
};

function DetailRow({
  label,
  value,
  mono = false,
  href,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
  href?: string | null;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/40 p-4">
      <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "break-all font-mono text-sm text-foreground"
            : "text-sm text-foreground"
        }
      >
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const rawQuery = typeof params.link === "string" ? params.link : "";
  const result = rawQuery ? await resolveLink(rawQuery) : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-card text-primary shadow-[0_0_30px_rgba(0,255,255,0.08)]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="20"
              cy="20"
              r="8"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="20" r="3" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
            Scanner
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Galileo Verify
          </h1>
        </div>
      </div>

      <a
        href="/scan"
        className="flex items-center gap-4 rounded-[28px] border border-primary/30 bg-primary/5 p-5 shadow-2xl shadow-black/20 backdrop-blur transition hover:bg-primary/10"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 8V6a2 2 0 0 1 2-2h2" />
            <path d="M4 16v2a2 2 0 0 0 2 2h2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
            <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Scan QR Code</p>
          <p className="text-xs text-muted-foreground">
            Use your camera to scan a product QR code
          </p>
        </div>
      </a>

      <section className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Paste a Digital Link</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Open a Galileo or GS1 Digital Link to verify a product with the
            existing public resolver.
          </p>
        </div>

        <form action="/" className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Digital Link or DID
            </span>
            <textarea
              name="link"
              defaultValue={rawQuery}
              rows={4}
              className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              placeholder="https://id.galileoprotocol.io/01/00012345678905/21/SERIAL-001"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            >
              Verify link
            </button>
            {result?.requestedUrl ? (
              <a
                href={result.requestedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-background"
              >
                Open
              </a>
            ) : null}
          </div>
        </form>
      </section>

      {result ? (
        <section className="mt-5 rounded-[28px] border border-border/80 bg-card p-5 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Verification result
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                {result.ok
                  ? (result.data?.name ?? "Verified product")
                  : "Unable to verify"}
              </h2>
            </div>
            {result.ok ? <StatusPill status={result.data?.status} /> : null}
          </div>

          {result.ok ? (
            <div className="mt-3">
              <BlockchainBadge blockchain={result.data?.blockchain} />
              {result.data?.blockchain ? (
                <VerificationDetails blockchain={result.data.blockchain} />
              ) : null}
            </div>
          ) : null}

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {result.ok
              ? (result.data?.description ??
                "This product resolved successfully through the public Galileo resolver.")
              : result.error}
          </p>

          <dl className="mt-5 grid gap-3">
            <DetailRow
              label="Requested link"
              value={result.requestedUrl}
              mono
            />
            {result.ok ? (
              <>
                <DetailRow label="Brand" value={result.data?.brand?.name} />
                <DetailRow label="GTIN" value={result.data?.gtin} mono />
                <DetailRow
                  label="Serial"
                  value={result.data?.serialNumber}
                  mono
                />
                <DetailRow label="Category" value={result.data?.category} />
                <DetailRow label="DID" value={result.data?.["@id"]} mono />
                <DetailRow
                  label="Passport link"
                  value={result.data?.passport?.digitalLink}
                  mono
                />

                {result.data?.passport?.txHash ? (
                  <>
                    <div className="mt-2 border-t border-border/40 pt-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Blockchain proof
                      </p>
                    </div>
                    <DetailRow
                      label="Transaction"
                      value={`${result.data.passport.txHash.slice(0, 10)}…${result.data.passport.txHash.slice(-8)}`}
                      mono
                      href={
                        result.data.passport.chainId
                          ? `${EXPLORER_URLS[result.data.passport.chainId] ?? "https://basescan.org"}/tx/${result.data.passport.txHash}`
                          : null
                      }
                    />
                    <DetailRow
                      label="Chain"
                      value={
                        result.data.passport.chainId
                          ? (CHAIN_NAMES[result.data.passport.chainId] ??
                            `Chain ${result.data.passport.chainId}`)
                          : null
                      }
                    />
                    <DetailRow
                      label="Minted"
                      value={
                        result.data.passport.mintedAt
                          ? new Date(
                              result.data.passport.mintedAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : null
                      }
                    />
                    <DetailRow
                      label="Token address"
                      value={result.data.passport.tokenAddress}
                      mono
                      href={
                        result.data.passport.chainId &&
                        result.data.passport.tokenAddress
                          ? `${EXPLORER_URLS[result.data.passport.chainId] ?? "https://basescan.org"}/address/${result.data.passport.tokenAddress}`
                          : null
                      }
                    />
                  </>
                ) : null}
              </>
            ) : (
              <DetailRow label="HTTP status" value={result.status} />
            )}
          </dl>
        </section>
      ) : null}

      {result?.ok &&
      result.data?.hasMaterialComposition &&
      result.data.hasMaterialComposition.length > 0 ? (
        <MaterialComposition materials={result.data.hasMaterialComposition} />
      ) : null}

      {result?.ok &&
      result.data?.provenance &&
      result.data.provenance.length > 0 ? (
        <ProvenanceTimeline events={result.data.provenance} />
      ) : null}

      <section className="mt-5 rounded-[28px] border border-border/60 bg-background/40 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          How it works
        </h2>
        <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          <li>
            1. Scan a QR code with your camera or paste a Galileo / GS1 Digital
            Link.
          </li>
          <li>
            2. The scanner normalizes the identifier and calls the existing
            public resolver route.
          </li>
          <li>
            3. You get a clear verified or not-found result with public product
            metadata only.
          </li>
        </ol>
      </section>
    </main>
  );
}
