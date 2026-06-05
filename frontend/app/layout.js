// app/layout.js
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Receipt Tracker',
  description: 'Organize and categorize your receipts'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
