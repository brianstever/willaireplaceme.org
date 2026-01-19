import { ReactNode } from "react";

interface AboutSectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export function AboutSection({ number, title, children }: AboutSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-accent font-mono text-xs">{number}</span>
        <h2 className="text-lg font-medium tracking-wide">{title}</h2>
      </div>
      <div className="pl-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
