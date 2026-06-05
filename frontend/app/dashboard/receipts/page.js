// app/dashboard/receipts/page.js
'use client';

import { useEffect, useState } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import { useRequireAuth } from '@/hooks/useAuth';
import ReceiptCard from '@/components/ReceiptCard';
import Link from 'next/link';

export default function ReceiptsPage() {
  const { requiresAuth } = useRequireAuth();
  const { receipts, loading, error, fetchReceipts, deleteReceipt, pagination } = useReceipts();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReceipts(page);
  }, [page]);

  if (requiresAuth) {
    return null;
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      const result = await deleteReceipt(id);
      if (result.success) {
        fetchReceipts(page);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
        <Link
          href="/dashboard/receipts/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Receipt
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading receipts...</p>
        </div>
      ) : receipts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receipts.map(receipt => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No receipts yet</p>
          <Link
            href="/dashboard/receipts/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first receipt →
          </Link>
        </div>
      )}
    </div>
  );
}
