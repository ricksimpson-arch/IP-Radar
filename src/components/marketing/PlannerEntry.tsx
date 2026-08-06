"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { copy } from "@/content/copy";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/FieldGroup";

/** Home Block 5 — a single live question that deep-links into /planner
    with the answer pre-filled (SPEC.md §8.1). */
export function PlannerEntry() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const params = value.trim() ? `?detail=${encodeURIComponent(value.trim().slice(0, 280))}` : "";
        router.push(`/planner${params}`);
      }}
    >
      <div className="flex-1">
        <label htmlFor="planner-entry" className="sr-only">
          {copy.home.plannerEntry.question}
        </label>
        <input
          id="planner-entry"
          type="text"
          maxLength={280}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={copy.home.plannerEntry.placeholder}
          className={inputClass}
        />
      </div>
      <Button type="submit">{copy.home.plannerEntry.cta}</Button>
    </form>
  );
}
