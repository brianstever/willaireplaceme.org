interface KeyValueItem {
  label: string;
  value: string;
}

interface KeyValueGridProps {
  items: KeyValueItem[];
  columns?: 1 | 2 | 4;
  variant?: "card" | "grid";
}

export function KeyValueGrid({ items, columns = 1, variant = "card" }: KeyValueGridProps) {
  if (variant === "grid") {
    const colClass = columns === 4 
      ? "grid-cols-2 md:grid-cols-4" 
      : columns === 2 
      ? "grid-cols-2" 
      : "grid-cols-1";
    
    return (
      <div className={`grid ${colClass} gap-3 text-xs font-mono`}>
        {items.map((item) => (
          <div key={item.label} className="bg-card/30 border border-card-border rounded p-3 text-center">
            <span className="text-foreground">{item.value}</span>
            <p className="text-muted-foreground text-[10px] mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-card-border rounded p-4 font-mono text-xs space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between">
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
