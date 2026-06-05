// app/dashboard/receipts/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import { useCategories } from '@/hooks/useCategories';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/utils/format';
import Link from 'next/link';

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getReceipt, updateItemCategory } = useReceipts();
  const { categories, fetchCategories } = useCategories();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const data = await getReceipt(params.id);
      if (data) {
        setReceipt(data);
        const selected = {};
        data.items?.forEach(item => {
          selected[item.id] = item.category_id;
        });
        setSelectedCategory(selected);
      }
      setLoading(false);
    };

    loadData();
    fetchCategories();
  }, [params.id]);

  const handleCategoryChange = async (itemId, newCategoryId) => {
    setSelectedCategory(prev => ({ ...prev, [itemId]: newCategoryId }));
    
    const result = await updateItemCategory(params.id, itemId, newCategoryId);
    if (!result.success) {
      alert('Failed to update category');
      setSelectedCategory(prev => ({
        ...prev,
        [itemId]: receipt.items.find(i => i.id === itemId).category_id
      }));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!receipt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Receipt not found</p>
        <Link href="/dashboard/receipts" className="text-blue-600 hover:text-blue-700">
          Back to receipts →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard/receipts" className="text-blue-600 hover:text-blue-700 mb-6">
        ← Back to receipts
      </Link>

      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{receipt.store_name}</h1>
            <p className="text-gray-600">{formatDate(receipt.receipt_date, 'long')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(receipt.total)}</p>
          </div>
        </div>

        {receipt.subtotal && (
          <div className="grid grid-cols-3 gap-4 pb-6 border-b">
            <div>
              <p className="text-gray-600 text-sm">Subtotal</p>
              <p className="text-lg font-semibold">{formatCurrency(receipt.subtotal)}</p>
            </div>
            {receipt.tax && (
              <div>
                <p className="text-gray-600 text-sm">Tax</p>
                <p className="text-lg font-semibold">{formatCurrency(receipt.tax)}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600 text-sm">Items</p>
              <p className="text-lg font-semibold">{receipt.items?.length || 0}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Items</h2>
        </div>

        <div className="divide-y">
          {receipt.items?.map(item => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.item_name}</h3>
                  {item.quantity && item.quantity !== 1 && (
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  )}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(item.cost)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory[item.id] || ''}
                  onChange={(e) => handleCategoryChange(item.id, e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
