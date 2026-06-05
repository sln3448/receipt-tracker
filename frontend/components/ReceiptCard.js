// components/ReceiptCard.js
'use client';

import Link from 'next/link';
import { formatCurrency, formatDate } from '@/utils/format';

export default function ReceiptCard({ receipt, onDelete }) {
  const itemCount = receipt.items?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{receipt.store_name}</h3>
          <p className="text-sm text-gray-500">{formatDate(receipt.receipt_date)}</p>
        </div>
        <span className="text-2xl font-bold text-blue-600">{formatCurrency(receipt.total)}</span>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        {receipt.source && (
          <span className="bg-gray-100 px-2 py-1 rounded text-xs capitalize">
            {receipt.source}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dashboard/receipts/${receipt.id}`}
          className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          View Details
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(receipt.id)}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
