"use client";

import { copy } from "@/content/copy";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="section-pad">
      <div className="container-site max-w-xl space-y-6">
        <p className="data-figure text-sm text-faint">500</p>
        <h1 className="text-4xl">{copy.errors.errorTitle}</h1>
        <p className="text-mute">{copy.errors.errorBody}</p>
        <Button onClick={reset}>Reload the page</Button>
      </div>
    </main>
  );
}
