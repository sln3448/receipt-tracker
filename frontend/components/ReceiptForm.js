// components/ReceiptForm.js
'use client';

import { useState } from 'react';
import { formatDate } from '@/utils/format';

export default function ReceiptForm({ onSubmit, loading = false, initialData = null }) {
  const [formData, setFormData] = useState({
    storeName: initialData?.store_name || '',
    receiptDate: initialData?.receipt_date || formatDate(new Date(), 'iso'),
    total: initialData?.total || '',
    subtotal: initialData?.subtotal || '',
    tax: initialData?.tax || '',
    items: initialData?.items || [{ name: '', cost: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', cost: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.storeName || !formData.receiptDate || !formData.total) {
      alert('Please fill in store name, date, and total');
      return;
    }

    const validItems = formData.items.filter(item => item.name && item.cost);
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    onSubmit({
      storeName: formData.storeName,
      receiptDate: formData.receiptDate,
      total: parseFloat(formData.total),
      subtotal: formData.subtotal ? parseFloat(formData.subtotal) : null,
      tax: formData.tax ? parseFloat(formData.tax) : null,
      items: validItems.map(item => ({
        name: item.name,
        cost: parseFloat(item.cost),
        quantity: item.quantity || 1
      }))
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Name *
          </label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="e.g., Whole Foods"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            name="receiptDate"
            value={formData.receiptDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total *
          </label>
          <input
            type="number"
            name="total"
            step="0.01"
            value={formData.total}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtotal
          </label>
          <input
            type="number"
            name="subtotal"
            step="0.01"
            value={formData.subtotal}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax
          </label>
          <input
            type="number"
            name="tax"
            step="0.01"
            value={formData.tax}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Items *</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add item
          </button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="Qty"
                  step="0.01"
                  value={item.quantity || 1}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="Cost"
                  step="0.01"
                  value={item.cost}
                  onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
      >
        {loading ? 'Saving...' : 'Save Receipt'}
      </button>
    </form>
  );
}
