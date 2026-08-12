import type { ReactNode } from "react";

export default function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h2 className="font-display text-3xl tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
