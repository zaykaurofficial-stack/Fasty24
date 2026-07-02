import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import Toaster from '@/components/Toaster';

export const metadata: Metadata = {
  title: 'Fasty-24 | Home Services in 15-20 Mins',
  description: 'On-demand AC repair, RO service, maid, fridge repair and more at your doorstep.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
