import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Navbar />
      <main className="flex-1 relative">
        {children}
      </main>
      <Footer />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
};
