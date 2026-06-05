// hooks/useCategories.js
'use client';

import { useState, useCallback } from 'react';
import api from '@/utils/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.categories.list();
      setCategories(response.data.categories);
      return response.data.categories;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch categories';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (name, color, icon) => {
    setError(null);
    try {
      const response = await api.categories.create(name, color, icon);
      const newCategory = response.data.category;
      setCategories([...categories, newCategory]);
      return { success: true, category: newCategory };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create category';
      setError(message);
      return { success: false, error: message };
    }
  }, [categories]);

  const updateCategory = useCallback(async (id, data) => {
    setError(null);
    try {
      const response = await api.categories.update(id, data);
      const updated = response.data.category;
      setCategories(categories.map(c => c.id === id ? updated : c));
      return { success: true, category: updated };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update category';
      setError(message);
      return { success: false, error: message };
    }
  }, [categories]);

  const deleteCategory = useCallback(async (id) => {
    setError(null);
    try {
      await api.categories.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to delete category';
      setError(message);
      return { success: false, error: message };
    }
  }, [categories]);

  const getCategoryById = useCallback((id) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  const getDefaultCategories = useCallback(() => {
    return categories.filter(c => c.is_default);
  }, [categories]);

  const getCustomCategories = useCallback(() => {
    return categories.filter(c => !c.is_default);
  }, [categories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getDefaultCategories,
    getCustomCategories
  };
}
