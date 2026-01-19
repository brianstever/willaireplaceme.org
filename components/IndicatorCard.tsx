interface IndicatorItem {
  icon: "up" | "down";
  text: string;
}

interface IndicatorCardProps {
  title: string;
  items: IndicatorItem[];
  variant?: "positive" | "negative";
}

export function IndicatorCard({ title, items, variant = "positive" }: IndicatorCardProps) {
  const iconColor = variant === "positive" ? "text-green-500" : "text-red-500";
  const arrow = variant === "positive" ? "↑" : "↓";

  return (
    <div className="bg-card/30 border border-card-border rounded p-4">
      <h3 className="font-mono text-xs text-accent mb-2">{title}</h3>
      <ul className="text-xs space-y-1.5">
        {items.map((item) => (
          <li key={item.text} className="flex items-start gap-2">
            <span className={iconColor}>{arrow}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
