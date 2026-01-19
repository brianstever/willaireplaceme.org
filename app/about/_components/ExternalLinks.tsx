interface ExternalLink {
  href: string;
  label: string;
}

interface ExternalLinksProps {
  title?: string;
  links: ExternalLink[];
}

export function ExternalLinks({ title, links }: ExternalLinksProps) {
  return (
    <section className="space-y-4">
      {title && (
        <h2 className="font-mono text-xs text-muted-foreground tracking-wider">{title}</h2>
      )}
      <ul className="text-xs text-muted-foreground space-y-2">
        {links.map((link) => (
          <li key={link.href} className="flex items-start gap-2">
            <span className="text-accent">→</span>
            <a 
              href={link.href}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors underline underline-offset-2"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
