import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { Inter } from 'next/font/google';
import { Providers } from '../components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'ClipAssist',
  description: 'AI Video Clipping Tool',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased bg-zinc-950 text-zinc-50" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

