"use client";

// Keyboard nav: skip to main content link (only visible on focus)
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-accent focus:rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background font-mono text-sm"
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
