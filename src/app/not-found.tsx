import Link from "next/link";
import { copy } from "@/content/copy";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="section-pad">
      <div className="container-site max-w-xl space-y-6">
        <p className="data-figure text-sm text-faint">404</p>
        <h1 className="text-4xl">{copy.errors.notFoundTitle}</h1>
        <p className="text-mute">{copy.errors.notFoundBody}</p>
        <div className="flex gap-4">
          <ButtonLink href="/">Go to the homepage</ButtonLink>
          <Link href="/planner" className="content-center text-sm text-mute underline underline-offset-4 hover:text-paper">
            Open the planner
          </Link>
        </div>
      </div>
    </main>
  );
}
