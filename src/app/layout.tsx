import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PromptBridge | Universal Autonomous AI Prompt Engineer Agent',
  description:
    'Ask First, Engineer Second. Transform messy human prompts and voice transcripts into mathematically optimal master prompts for ChatGPT, Claude, Gemini, and DeepSeek.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen ambient-warm-bg text-[#1B0E07] flex flex-col selection:bg-[#FFB74D]/40 selection:text-[#1B0E07]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
