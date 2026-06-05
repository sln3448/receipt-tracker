// app/dashboard/categories/page.js
'use client';

import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useRequireAuth } from '@/hooks/useAuth';

export default function CategoriesPage() {
  const { requiresAuth } = useRequireAuth();
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#4CAF50', icon: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  if (requiresAuth) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      const result = await updateCategory(editingId, formData);
      if (result.success) {
        setEditingId(null);
        setFormData({ name: '', color: '#4CAF50', icon: '' });
        setShowForm(false);
      }
    } else {
      const result = await createCategory(formData.name, formData.color, formData.icon);
      if (result.success) {
        setFormData({ name: '', color: '#4CAF50', icon: '' });
        setShowForm(false);
      }
    }

    setLoading(false);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', color: '#4CAF50', icon: '' });
  };

  const defaultCategories = categories.filter(c => c.is_default);
  const customCategories = categories.filter(c => !c.is_default);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Category' : 'Create Custom Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Pet Supplies"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="h-10 w-full border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Default Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultCategories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-semibold text-gray-900">{category.name}</span>
              </div>
              <p className="text-xs text-gray-500">Default (cannot delete)</p>
            </div>
          ))}
        </div>
      </div>

      {customCategories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map(category => (
              <div key={category.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-semibold text-gray-900">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-300 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this category?')) {
                        deleteCategory(category.id);
                      }
                    }}
                    className="flex-1 text-sm text-red-600 hover:text-red-700 font-medium py-2 border border-red-300 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
