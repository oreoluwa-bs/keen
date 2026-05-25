"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-dvh flex flex-col items-center justify-center gap-3 p-8 bg-background">
          <span className="text-[14px] font-medium text-foreground">
            Something went wrong
          </span>
          <span className="text-[13px] text-muted-foreground text-center max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </span>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-[13px] text-foreground underline underline-offset-2 mt-2"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
