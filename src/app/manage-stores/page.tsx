'use client';

import { useState, useEffect } from 'react';
import styles from './manage-stores.module.css';
import ProtectedRoute from '@/components/ProtectedRoute';

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

function ManageStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the user-specific stores endpoint
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: numValue
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          createdBy: 'user123' // In real app, get from auth context
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(editingStore ? 'Store updated successfully!' : 'Store created successfully!');
        setFormData(initialFormData);
        setEditingStore(null);
        setShowForm(false);
        fetchStores(); // Refresh the stores list
      } else {
        setError(data.error || `Failed to ${editingStore ? 'update' : 'create'} store`);
      }
    } catch (error) {
      console.error('Error saving store:', error);
      setError(`Failed to ${editingStore ? 'update' : 'create'} store. Please check your connection and try again.`);
    }
  };

  const handleEdit = (store: Store) => {
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
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Store deleted successfully!');
        fetchStores(); // Refresh the stores list
      } else {
        setError(data.error || 'Failed to delete store');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      setError('Failed to delete store. Please check your connection and try again.');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingStore(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading stores...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Development Mode Indicator */}
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

      <div className={styles.header}>
        <h1 className={styles.title}>Manage Your Stores</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={styles.addButton}
        >
          {showForm ? 'Cancel' : 'Add New Store'}
        </button>
      </div>

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
        <div className={styles.formContainer}>
          <h2>{editingStore ? 'Edit Store' : 'Add New Store'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="storeName">Store Name *</label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter store name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="storeType">Store Type *</label>
                <select
                  id="storeType"
                  name="storeType"
                  value={formData.storeType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select store type</option>
                  {storeTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter country"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rating">Rating</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter store description"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="hours">Business Hours</label>
              <input
                type="text"
                id="hours"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                placeholder="e.g., Mon-Fri 9AM-6PM, Sat 10AM-4PM"
              />
            </div>

            <div className={styles.coordinatesGroup}>
              <label>Coordinates</label>
              <div className={styles.coordinatesInputs}>
                <input
                  type="number"
                  placeholder="Latitude"
                  value={formData.coordinates.lat}
                  onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                  step="any"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={formData.coordinates.lng}
                  onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                  step="any"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Tags</label>
              <div className={styles.tagsContainer}>
                <div className={styles.tagsInput}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className={styles.addTagButton}>
                    Add
                  </button>
                </div>
                <div className={styles.tagsList}>
                  {formData.tags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className={styles.removeTag}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                {editingStore ? 'Update Store' : 'Create Store'}
              </button>
              <button type="button" onClick={resetForm} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.storesList}>
        <h2>Your Stores ({stores.length})</h2>
        {stores.length === 0 ? (
          <div className={styles.noStores}>
            <p>No stores found. Create your first store to get started!</p>
          </div>
        ) : (
          <div className={styles.storesGrid}>
            {stores.map(store => (
              <div key={store._id} className={styles.storeCard}>
                <div className={styles.storeHeader}>
                  <h3>{store.storeName}</h3>
                  <span className={styles.storeType}>{store.storeType}</span>
                </div>
                
                <div className={styles.storeInfo}>
                  <p className={styles.address}>📍 {store.address}</p>
                  <p className={styles.country}>🌍 {store.country}</p>
                  {store.phone && <p className={styles.phone}>📞 {store.phone}</p>}
                  {store.email && <p className={styles.email}>✉️ {store.email}</p>}
                  {store.website && <p className={styles.website}>🌐 {store.website}</p>}
                  {store.hours && <p className={styles.hours}>🕒 {store.hours}</p>}
                  {store.rating > 0 && <p className={styles.rating}>⭐ {store.rating}/5</p>}
                  {store.description && <p className={styles.description}>{store.description}</p>}
                </div>

                {store.tags && store.tags.length > 0 && (
                  <div className={styles.tags}>
                    {store.tags.map(tag => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                )}

                <div className={styles.storeActions}>
                  <button
                    onClick={() => handleEdit(store)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(store._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>

                <div className={styles.storeMeta}>
                  <small>Created: {new Date(store.createdAt).toLocaleDateString()}</small>
                  {store.updatedAt !== store.createdAt && (
                    <small>Updated: {new Date(store.updatedAt).toLocaleDateString()}</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
