import { type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CompareBar } from '@/components/cars/CompareBar';

interface PublicLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function PublicLayout({ children, hideHeader, hideFooter }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CompareBar />
    </div>
  );
}
