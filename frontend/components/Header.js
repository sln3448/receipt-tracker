// components/Header.js
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          💰 Receipt Tracker
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/dashboard/receipts" className="text-gray-600 hover:text-gray-900">
                Receipts
              </Link>
              <Link href="/dashboard/analytics" className="text-gray-600 hover:text-gray-900">
                Analytics
              </Link>
              <Link href="/dashboard/categories" className="text-gray-600 hover:text-gray-900">
                Categories
              </Link>

              <div className="border-l pl-6">
                <span className="text-sm text-gray-600 mr-4">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
