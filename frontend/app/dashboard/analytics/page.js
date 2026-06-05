// app/dashboard/analytics/page.js
'use client';

import { useEffect, useState } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import { useCategories } from '@/hooks/useCategories';
import { useRequireAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export default function AnalyticsPage() {
  const { requiresAuth } = useRequireAuth();
  const { receipts, fetchReceipts } = useReceipts();
  const { categories, fetchCategories } = useCategories();
  const [timeRange, setTimeRange] = useState('all');
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchReceipts(1, 1000);
    fetchCategories();
  }, []);

  useEffect(() => {
    if (receipts.length > 0 && categories.length > 0) {
      const now = new Date();
      let filteredReceipts = receipts;

      if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filteredReceipts = receipts.filter(r => new Date(r.receipt_date) >= cutoff);
      }

      const spending = {};
      filteredReceipts.forEach(receipt => {
        receipt.items?.forEach(item => {
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
      });

      setCategoryData(
        Object.values(spending)
          .sort((a, b) => b.value - a.value)
          .map(item => ({
            ...item,
            value: Math.round(item.value * 100) / 100
          }))
      );

      const daily = {};
      filteredReceipts.forEach(receipt => {
        const date = formatDate(receipt.receipt_date);
        if (!daily[date]) daily[date] = 0;
        daily[date] += receipt.total || 0;
      });

      setTrendData(
        Object.entries(daily)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
      );
    }
  }, [receipts, categories, timeRange]);

  if (requiresAuth) {
    return null;
  }

  const filteredReceipts = timeRange === 'all'
    ? receipts
    : receipts.filter(r => {
      const days = parseInt(timeRange);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return new Date(r.receipt_date) >= cutoff;
    });

  const totalSpent = filteredReceipts.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-4 py-2 rounded-lg font-medium ${
              timeRange === '30'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90')}
            className={`px-4 py-2 rounded-lg font-medium ${
              timeRange === '90'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Spent</h3>
        <p className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(totalSpent)}</p>
        <p className="text-gray-600">
          {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''} •
          Avg: {formatCurrency(filteredReceipts.length > 0 ? totalSpent / filteredReceipts.length : 0)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => name}
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
            <p className="text-gray-500">No data</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Categories</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spending Trend</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Daily Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categoryData.map((cat, idx) => {
                const percentage = Math.round((cat.value / totalSpent) * 100);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(cat.value)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
