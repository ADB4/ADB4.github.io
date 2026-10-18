import './globals.css';
import './normalize.css';

import { ThemeProvider } from 'next-themes'
import ClientLayout from '../components/clientlayout'
export const metadata = {
  title: 'andy bui',
  description: 'fun',
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
/*
        <Navigation />
        <main>
          <div className="main-container">
            {children}
          </div>
        </main>
*/