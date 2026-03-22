import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-[2rem] border-none shadow-2xl overflow-hidden">
            <CardHeader className="bg-destructive/5 text-destructive pb-8">
              <AlertCircle className="h-10 w-10 mb-4" />
              <CardTitle className="text-2xl font-bold">მოხდა შეცდომა</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <p className="text-slate-600">გთხოვთ, სცადოთ გვერდის განახლება.</p>
              <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-xl font-bold gap-2">
                <RefreshCcw className="h-4 w-4" /> განახლება
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
