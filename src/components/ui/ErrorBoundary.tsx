'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Boundary component for catching React errors
 * 
 * Usage:
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Algo salió mal
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Section Error Boundary - specific error boundary for form sections
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName 
}: { 
  children: React.ReactNode; 
  sectionName: string;
}) {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error(`Error in ${sectionName}:`, error);
      }}
      fallback={
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <h3 className="font-semibold text-destructive mb-2">
            Error en {sectionName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Esta sección encontró un problema. Intenta recargar la página.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
