import './globals.css';
import Navbar from '@/ui/organisms/Navbar';

export const metadata = { title: 'Hempin Account' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}