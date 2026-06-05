// app/page.js
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-white space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold">
            💰 Receipt Tracker
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            Organize receipts. Track spending. Gain insights.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-white">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-xl font-semibold mb-2">Capture Receipts</h3>
              <p>Snap photos or manually enter receipt details in seconds</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-white">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-xl font-semibold mb-2">Categorize Items</h3>
              <p>Organize spending with flexible, customizable categories</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-white">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-xl font-semibold mb-2">Analyze Spending</h3>
              <p>Visualize trends and understand where your money goes</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-12">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
