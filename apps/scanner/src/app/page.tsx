export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Galileo Protocol icon */}
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-card">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Galileo Protocol"
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
          <circle
            cx="20"
            cy="20"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary"
          />
          <circle cx="20" cy="20" r="3" fill="currentColor" className="text-primary" />
          <line
            x1="20"
            y1="4"
            x2="20"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/50"
          />
          <line
            x1="20"
            y1="28"
            x2="20"
            y2="36"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/50"
          />
          <line
            x1="4"
            y1="20"
            x2="12"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/50"
          />
          <line
            x1="28"
            y1="20"
            x2="36"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/50"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Galileo Scanner
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-xl font-medium text-primary">Coming Soon</p>

      {/* Description */}
      <p className="mt-6 max-w-md text-muted-foreground">
        Authenticate luxury products instantly. Scan Digital Product Passports to
        verify provenance, ownership, and authenticity — powered by the Galileo
        Protocol.
      </p>

      {/* Decorative divider */}
      <div className="mt-10 h-px w-24 bg-primary/30" />

      <p className="mt-6 text-sm text-muted-foreground/60">
        Part of the Galileo Protocol ecosystem
      </p>
    </main>
  );
}
