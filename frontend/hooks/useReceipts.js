// hooks/useReceipts.js
'use client';

import { useState, useCallback } from 'react';
import api from '@/utils/api';

export function useReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchReceipts = useCallback(async (page = 1, limit = 20, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.receipts.list(page, limit, filters);
      setReceipts(response.data.receipts);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch receipts';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReceipt = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.receipts.get(id);
      return response.data.receipt;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch receipt';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReceipt = useCallback(async (data) => {
    setError(null);
    try {
      const response = await api.receipts.create(data);
      const newReceipt = response.data.receipt;
      setReceipts([newReceipt, ...receipts]);
      return { success: true, receipt: newReceipt };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create receipt';
      setError(message);
      return { success: false, error: message };
    }
  }, [receipts]);

  const updateReceipt = useCallback(async (id, data) => {
    setError(null);
    try {
      const response = await api.receipts.update(id, data);
      const updated = response.data.receipt;
      setReceipts(receipts.map(r => r.id === id ? updated : r));
      return { success: true, receipt: updated };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update receipt';
      setError(message);
      return { success: false, error: message };
    }
  }, [receipts]);

  const deleteReceipt = useCallback(async (id) => {
    setError(null);
    try {
      await api.receipts.delete(id);
      setReceipts(receipts.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to delete receipt';
      setError(message);
      return { success: false, error: message };
    }
  }, [receipts]);

  const updateItemCategory = useCallback(async (receiptId, itemId, categoryId) => {
    setError(null);
    try {
      const response = await api.receipts.updateItemCategory(receiptId, itemId, categoryId);
      return { success: true, item: response.data.item };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update item category';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    receipts,
    loading,
    error,
    pagination,
    fetchReceipts,
    getReceipt,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    updateItemCategory
  };
}
