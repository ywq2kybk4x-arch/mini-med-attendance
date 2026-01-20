import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk, Work_Sans } from 'next/font/google';
import PwaRegister from '@/components/PwaRegister';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display'
});
const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'Mini Med Attendance',
  description: 'QR-based attendance system',
  manifest: '/manifest.json',
  themeColor: '#1a232c'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${workSans.variable}`}>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
