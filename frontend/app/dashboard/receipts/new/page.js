// app/dashboard/receipts/new/page.js
'use client';

import { useState } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import { useRouter } from 'next/navigation';
import ReceiptForm from '@/components/ReceiptForm';

export default function NewReceiptPage() {
  const router = useRouter();
  const { createReceipt } = useReceipts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await createReceipt(data);

    if (result.success) {
      router.push(`/dashboard/receipts/${result.receipt.id}`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Receipt</h1>
        <p className="text-gray-600">Enter receipt details and items below</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8">
        <ReceiptForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
