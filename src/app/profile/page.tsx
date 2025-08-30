'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './profile.module.css';

// Lazy load store management components
const StoreForm = lazy(() => import('../manage-stores/StoreForm'));
const StoreCard = lazy(() => import('../manage-stores/StoreCard'));

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

// Memoized profile header section
const ProfileHeader = React.memo(({ user }: { user: any }) => (
  <div className={styles.profileHeader}>
    <div className={styles.avatar}>
      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
    <div className={styles.userInfo}>
      <h1 className={styles.name}>{user?.name || 'User'}</h1>
      <p className={styles.email}>{user?.email}</p>
      <span className={styles.role}>{user?.role}</span>
    </div>
  </div>
));

ProfileHeader.displayName = 'ProfileHeader';

// Memoized account information section
const AccountInfo = React.memo(({ user }: { user: any }) => (
  <div className={styles.section}>
    <h2>Account Information</h2>
    <div className={styles.infoGrid}>
      <div className={styles.infoItem}>
        <label>Name</label>
        <span>{user?.name || 'Not provided'}</span>
      </div>
      <div className={styles.infoItem}>
        <label>Email</label>
        <span>{user?.email}</span>
      </div>
      <div className={styles.infoItem}>
        <label>Role</label>
        <span className={styles.roleBadge}>{user?.role}</span>
      </div>
      <div className={styles.infoItem}>
        <label>User ID</label>
        <span className={styles.userId}>{user?.id}</span>
      </div>
    </div>
  </div>
));

AccountInfo.displayName = 'AccountInfo';

// Memoized quick actions section
const QuickActions = React.memo(() => (
  <div className={styles.section}>
    <h2>Quick Actions</h2>
    <div className={styles.actions}>
      <button className={styles.actionButton}>
        <span>✏️</span>
        Edit Profile
      </button>
      <button className={styles.actionButton}>
        <span>🔒</span>
        Change Password
      </button>
    </div>
  </div>
));

QuickActions.displayName = 'QuickActions';

// Memoized store management header
const StoreManagementHeader = React.memo(({ 
  showForm, 
  onToggleForm,
  storeCount
}: { 
  showForm: boolean; 
  onToggleForm: () => void;
  storeCount: number;
}) => (
  <div className={styles.storeHeader}>
    <div className={styles.storeHeaderLeft}>
      <h2>Store Management</h2>
      <p className={styles.storeCount}>
        {storeCount} {storeCount === 1 ? 'store' : 'stores'} managed
      </p>
    </div>
    <button 
      onClick={onToggleForm} 
      className={styles.addStoreButton}
    >
      {showForm ? 'Cancel' : '+ Add New Store'}
    </button>
  </div>
));

StoreManagementHeader.displayName = 'StoreManagementHeader';

// Memoized store statistics
const StoreStats = React.memo(({ stores }: { stores: Store[] }) => {
  const stats = useMemo(() => {
    const activeStores = stores.filter(store => store.isActive).length;
    const totalStores = stores.length;
    const avgRating = stores.length > 0 
      ? (stores.reduce((sum, store) => sum + (store.rating || 0), 0) / stores.length).toFixed(1)
      : '0.0';
    
    return { activeStores, totalStores, avgRating };
  }, [stores]);

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <h3>Total Stores</h3>
        <p className={styles.statValue}>{stats.totalStores}</p>
        <span className={styles.statLabel}>All stores</span>
      </div>
      <div className={styles.statCard}>
        <h3>Active Stores</h3>
        <p className={styles.statValue}>{stats.activeStores}</p>
        <span className={styles.statLabel}>Currently active</span>
      </div>
      <div className={styles.statCard}>
        <h3>Avg Rating</h3>
        <p className={styles.statValue}>{stats.avgRating}</p>
        <span className={styles.statLabel}>Store ratings</span>
      </div>
    </div>
  );
});

StoreStats.displayName = 'StoreStats';

const ProfilePage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);

  // Fetch user's stores on component mount
  useEffect(() => {
    fetchUserStores();
  }, []);

  const fetchUserStores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores/user');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, []);



  const handleToggleForm = useCallback(() => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingStore(null);
      setFormData(initialFormData);
    }
  }, [showForm]);

  const handleEditStore = useCallback((store: Store) => {
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

  const handleDeleteStore = useCallback(async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;
    
    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setStores(prev => prev.filter(store => store._id !== storeId));
      }
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  }, []);

  const handleSubmitStore = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchUserStores();
        setShowForm(false);
        setEditingStore(null);
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error saving store:', error);
    }
  }, [editingStore, formData, fetchUserStores]);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingStore(null);
    setFormData(initialFormData);
  }, []);

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.dashboard}>
          {/* Profile Section */}
          <div className={styles.profileSection}>
            <ProfileHeader user={user} />
            <AccountInfo user={user} />
            <QuickActions />
          </div>

          {/* Store Management Section */}
          <div className={styles.storeSection}>
            <StoreManagementHeader 
              showForm={showForm} 
              onToggleForm={handleToggleForm}
              storeCount={stores.length}
            />
            
            <StoreStats stores={stores} />

            {showForm && (
              <Suspense fallback={<div className={styles.loading}>Loading form...</div>}>
                <StoreForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmitStore}
                  onCancel={handleCancelForm}
                  editingStore={editingStore}
                  storeTypes={storeTypes}
                />
              </Suspense>
            )}

            {!showForm && (
              <div className={styles.storesContainer}>
                {loading ? (
                  <div className={styles.loading}>Loading stores...</div>
                ) : stores.length === 0 ? (
                  <div className={styles.emptyState}>
                    <h3>No stores yet</h3>
                    <p>Start by adding your first store to get started!</p>
                    <button 
                      onClick={handleToggleForm}
                      className={styles.addFirstStoreButton}
                    >
                      + Add Your First Store
                    </button>
                  </div>
                ) : (
                  <div className={styles.storesGrid}>
                    {stores.map(store => (
                      <Suspense key={store._id} fallback={<div className={styles.loading}>Loading...</div>}>
                        <StoreCard
                          store={store}
                          onEdit={handleEditStore}
                          onDelete={handleDeleteStore}
                        />
                      </Suspense>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
