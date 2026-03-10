import type { Metadata } from 'next';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'FocusNest — Build your focus. Grow your skills.',
  description: 'Pomodoro timer, notes, and analytics for focused learners.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#0c0f0a; color:#e8e0cc; }
          ::-webkit-scrollbar { width:6px; }
          ::-webkit-scrollbar-track { background:#141710; }
          ::-webkit-scrollbar-thumb { background:#252b1f; border-radius:3px; }
          ::-webkit-scrollbar-thumb:hover { background:#4a7c59; }
        `}</style>
      </head>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
