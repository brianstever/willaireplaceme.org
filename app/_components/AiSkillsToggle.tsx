"use client";

interface AiSkillsToggleProps {
  enabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function AiSkillsToggle({ enabled, onToggle, isLoading }: AiSkillsToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={enabled}
      className={`
        px-3 py-1.5 rounded-md text-xs font-mono
        border transition-all duration-200
        ${enabled 
          ? "bg-accent/10 border-accent/30 text-accent" 
          : "bg-card/30 border-card-border text-muted-foreground hover:border-accent/30 hover:text-accent"
        }
        ${isLoading ? "animate-pulse" : ""}
      `}
    >
      USAJOBS AI Signal
    </button>
  );
}
