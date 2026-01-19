"use client";

import { Component, ReactNode } from "react";

interface ChartErrorBoundaryProps {
  children: ReactNode;
  chartName?: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary specifically for charts - shows a nicer fallback with retry
export class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error(`Chart error (${this.props.chartName || "chart"}):`, error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-label={`Error loading ${this.props.chartName || "chart"}`}
          className="chart-container flex-1 flex flex-col items-center justify-center p-6 min-h-[200px]"
        >
          <svg
            className="w-12 h-12 text-muted-foreground/50 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l4-4 4 4 5-5" />
            <circle cx="18" cy="9" r="2" />
          </svg>
          <h3 className="text-sm font-medium text-foreground mb-1">
            Unable to load {this.props.chartName || "chart"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
            There was a problem rendering the visualization. This may be due to
            invalid data or a temporary issue.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider bg-secondary/30 hover:bg-secondary/50 rounded border border-card-border transition-colors"
            aria-label="Retry loading chart"
          >
            Retry
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4 w-full max-w-md">
              <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                Error Details
              </summary>
              <pre className="mt-2 p-3 text-[10px] text-left bg-card/50 border border-card-border rounded overflow-auto">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
