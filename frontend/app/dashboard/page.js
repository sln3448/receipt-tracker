// app/dashboard/page.js (dashboard home)
'use client';

import { useEffect, useState } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import { useCategories } from '@/hooks/useCategories';
import { useRequireAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export default function DashboardPage() {
  const { requiresAuth } = useRequireAuth();
  const { receipts, loading: receiptsLoading, fetchReceipts } = useReceipts();
  const { categories, fetchCategories } = useCategories();
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchReceipts(1, 100);
    fetchCategories();
  }, []);

  useEffect(() => {
    if (receipts.length > 0 && categories.length > 0) {
      const spending = {};

      receipts.forEach(receipt => {
        if (receipt.items) {
          receipt.items.forEach(item => {
            const categoryId = item.category_id || 'uncategorized';
            if (!spending[categoryId]) {
              const category = categories.find(c => c.id === categoryId);
              spending[categoryId] = {
                name: category?.name || 'Uncategorized',
                value: 0,
                color: category?.color || '#999'
              };
            }
            spending[categoryId].value += item.cost || 0;
          });
        }
      });

      setCategoryData(Object.values(spending).map(item => ({
        ...item,
        value: Math.round(item.value * 100) / 100
      })));
    }
  }, [receipts, categories]);

  if (requiresAuth) {
    return null;
  }

  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const receiptCount = receipts.length;
  const averagePerReceipt = receiptCount > 0 ? totalSpent / receiptCount : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Spent</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Receipts</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{receiptCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Average per Receipt</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(averagePerReceipt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No spending data yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Receipts</h2>
          {receiptsLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : receipts.length > 0 ? (
            <div className="space-y-3">
              {receipts.slice(0, 5).map(receipt => (
                <Link
                  key={receipt.id}
                  href={`/dashboard/receipts/${receipt.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{receipt.store_name}</h3>
                      <p className="text-xs text-gray-500">{formatDate(receipt.receipt_date)}</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(receipt.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No receipts yet</p>
          )}
          <Link
            href="/dashboard/receipts"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}
