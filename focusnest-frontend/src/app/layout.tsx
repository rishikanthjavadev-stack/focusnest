import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FocusNest — Build your focus. Grow your skills.',
  description: 'A productivity and learning platform for students, researchers, and professionals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: '#0c0f0a', color: '#e8e0cc', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
