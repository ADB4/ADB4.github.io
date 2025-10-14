import Navigation from '../components/navigation';
import './globals.css';


import { ThemeProvider } from 'next-themes'
import ClientLayout from '../components/clientlayout'
export const metadata = {
  title: 'ha',
  description: 'fun',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
/*
        <Navigation />
        <main>
          <div className="main-container">
            {children}
          </div>
        </main>
*/