"use client";

// Root-level error boundary: renders its own <html> because the root layout
// may have failed. Styles are inline for the same reason.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#070B14", color: "#F4F7FB", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "6rem 1.5rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Something went wrong on our side.
          </h1>
          <p style={{ color: "#9AA9C0", marginBottom: "2rem" }}>
            The error has been recorded. Reload the page to try again, or contact us if it keeps
            happening.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#35F0A0",
              color: "#070B14",
              border: 0,
              borderRadius: 6,
              padding: "0.75rem 1.25rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
        </main>
      </body>
    </html>
  );
}
