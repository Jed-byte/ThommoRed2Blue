import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            retry={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-600">Something went wrong</CardTitle>
              <CardDescription>
                The application encountered an unexpected error
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Don't worry - your data is safe. Try refreshing the page or going back to the home page.
              </p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
              {this.state.error && (
                <details className="text-left text-xs text-gray-500 mt-4">
                  <summary className="cursor-pointer mb-2">Error details</summary>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component for navigation errors
export function NavigationErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="text-red-600" size={20} />
        <h3 className="text-red-800 font-medium">Navigation Error</h3>
      </div>
      <p className="text-red-700 text-sm mb-3">
        There was a problem loading this page.
      </p>
      <div className="flex space-x-2">
        <Button size="sm" onClick={retry} variant="outline">
          Try Again
        </Button>
        <Button size="sm" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

// Chat-specific error fallback
export function ChatErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto h-[500px] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6" />
          <div>
            <CardTitle className="text-lg">Chat with Flo</CardTitle>
            <p className="text-sm text-blue-100">Your AI Mental Performance Coach</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex items-center justify-center h-[calc(100%-100px)]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Chat temporarily unavailable</p>
          <div className="space-y-2">
            <Button 
              onClick={retry}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}