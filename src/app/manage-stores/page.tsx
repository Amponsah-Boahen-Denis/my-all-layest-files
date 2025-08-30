'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import styles from './manage-stores.module.css';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load heavy components
const StoreForm = lazy(() => import('./StoreForm'));
const StoreCard = lazy(() => import('./StoreCard'));

interface Store {
  _id: string;
  storeName: string;
  storeType: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  hours?: string;
  rating?: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StoreFormData {
  storeName: string;
  storeType: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  hours: string;
  rating: number;
  tags: string[];
}

const initialFormData: StoreFormData = {
  storeName: '',
  storeType: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  country: '',
  coordinates: { lat: 0, lng: 0 },
  description: '',
  hours: '',
  rating: 0,
  tags: []
};

const storeTypes = [
  'electronics', 'clothing', 'supermarket', 'books', 'furniture', 
  'pharmacy', 'sports', 'toys', 'hardware', 'automotive', 
  'beauty', 'household', 'computing', 'gardening', 'pets', 
  'baby', 'jewelry', 'retail', 'restaurant', 'service', 
  'healthcare', 'education', 'entertainment', 'technology', 'other'
];

// Memoized development mode indicator
const DevelopmentModeIndicator = React.memo(() => (
  <div style={{
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    color: 'white',
    textAlign: 'center',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
  }}>
    🔓 DEVELOPMENT MODE: All features accessible without authentication
  </div>
));

DevelopmentModeIndicator.displayName = 'DevelopmentModeIndicator';

// Memoized header section
const HeaderSection = React.memo(({ 
  showForm, 
  onToggleForm 
}: { 
  showForm: boolean; 
  onToggleForm: () => void;
}) => (
  <div className={styles.header}>
    <h1 className={styles.title}>Manage Your Stores</h1>
    <button onClick={onToggleForm} className={styles.addButton}>
      {showForm ? 'Cancel' : 'Add New Store'}
    </button>
  </div>
));

HeaderSection.displayName = 'HeaderSection';

// Memoized stores list
const StoresList = React.memo(({ 
  stores, 
  onEdit, 
  onDelete 
}: { 
  stores: Store[]; 
  onEdit: (store: Store) => void; 
  onDelete: (storeId: string) => void;
}) => (
  <div className={styles.storesList}>
    <h2>Your Stores ({stores.length})</h2>
    {stores.length === 0 ? (
      <div className={styles.noStores}>
        <p>No stores found. Create your first store to get started!</p>
      </div>
    ) : (
      <div className={styles.storesGrid}>
        {stores.map(store => (
          <Suspense key={store._id} fallback={<div className={styles.loading}>Loading...</div>}>
            <StoreCard 
              store={store} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          </Suspense>
        ))}
      </div>
    )}
  </div>
));

StoresList.displayName = 'StoresList';

function ManageStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/stores/user?userId=user123&limit=100');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStores(data.stores || []);
        } else {
          setError(data.error || 'Failed to fetch stores');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to fetch stores. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingStore 
        ? `/api/stores/${editingStore._id}`
        : '/api/stores';
      
      const method = editingStore ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'user123'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(editingStore ? 'Store updated successfully!' : 'Store created successfully!');
        setFormData(initialFormData);
        setEditingStore(null);
        setShowForm(false);
        fetchStores();
      } else {
        setError(data.error || `Failed to ${editingStore ? 'update' : 'create'} store`);
      }
    } catch (error) {
      console.error('Error saving store:', error);
      setError(`Failed to ${editingStore ? 'update' : 'create'} store. Please check your connection and try again.`);
    }
  }, [editingStore, formData, fetchStores]);

  const handleEdit = useCallback((store: Store) => {
    setEditingStore(store);
    setFormData({
      storeName: store.storeName,
      storeType: store.storeType,
      address: store.address,
      phone: store.phone || '',
      email: store.email || '',
      website: store.website || '',
      country: store.country,
      coordinates: store.coordinates || { lat: 0, lng: 0 },
      description: store.description || '',
      hours: store.hours || '',
      rating: store.rating || 0,
      tags: store.tags || []
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Store deleted successfully!');
        fetchStores();
      } else {
        setError(data.error || 'Failed to delete store');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      setError('Failed to delete store. Please check your connection and try again.');
    }
  }, [fetchStores]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingStore(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  }, []);

  const toggleForm = useCallback(() => {
    setShowForm(!showForm);
    if (showForm) {
      resetForm();
    }
  }, [showForm, resetForm]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading stores...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DevelopmentModeIndicator />

      <HeaderSection showForm={showForm} onToggleForm={toggleForm} />

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')} className={styles.closeError}>×</button>
        </div>
      )}

      {success && (
        <div className={styles.success}>
          {success}
          <button onClick={() => setSuccess('')} className={styles.closeSuccess}>×</button>
        </div>
      )}

      {showForm && (
        <Suspense fallback={<div className={styles.loading}>Loading form...</div>}>
          <StoreForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            editingStore={editingStore}
            storeTypes={storeTypes}
          />
        </Suspense>
      )}

      <StoresList 
        stores={stores} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}

const ProtectedManageStoresPage = () => {
  return (
    <ProtectedRoute>
      <ManageStoresPage />
    </ProtectedRoute>
  );
};

export default ProtectedManageStoresPage;
