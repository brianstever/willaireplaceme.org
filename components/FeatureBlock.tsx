interface FeatureBlockProps {
  title: string;
  description: string;
  borderColor?: string;
}

export function FeatureBlock({ title, description, borderColor = "border-accent" }: FeatureBlockProps) {
  return (
    <div className={`border-l-2 ${borderColor} pl-4`}>
      <h3 className="font-mono text-xs text-foreground mb-1">{title}</h3>
      <p className="text-xs">{description}</p>
    </div>
  );
}
