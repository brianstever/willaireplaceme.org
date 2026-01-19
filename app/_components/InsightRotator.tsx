"use client";

import { useState, useEffect } from "react";

interface InsightRotatorProps {
  insights: string[];
  centered?: boolean;
}

export function InsightRotator({ insights, centered = false }: InsightRotatorProps) {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [visible, setVisible] = useState(true);

  // cycle through insights every 6s with fade
  useEffect(() => {
    if (insights.length === 0) return;
    
    let fadeTimeout: NodeJS.Timeout;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
        setVisible(true);
      }, 300);
    }, 6000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [insights.length]);

  if (insights.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`text-[11px] text-muted-foreground font-mono max-w-[300px] leading-relaxed transition-opacity duration-300 ${
        centered ? "text-center" : "sm:text-right"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <span className="text-accent/60 mr-1.5" aria-hidden="true">●</span>
      {insights[currentInsight % insights.length]}
    </div>
  );
}
