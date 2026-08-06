import { Eyebrow } from "./Eyebrow";

export function SectionHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="max-w-2xl space-y-4">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-[clamp(2rem,3.5vw,3rem)]">{title}</h2>
      {lede ? <p className="text-mute">{lede}</p> : null}
    </header>
  );
}
