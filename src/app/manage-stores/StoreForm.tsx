'use client';

import React, { useState, useCallback } from 'react';
import styles from './manage-stores.module.css';

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

interface StoreFormProps {
  formData: StoreFormData;
  setFormData: React.Dispatch<React.SetStateAction<StoreFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  editingStore: any;
  storeTypes: string[];
}

const StoreForm: React.FC<StoreFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingStore,
  storeTypes
}) => {
  const [newTag, setNewTag] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, [setFormData]);

  const handleCoordinateChange = useCallback((field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: numValue
      }
    }));
  }, [setFormData]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags, setFormData]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, [setFormData]);

  return (
    <div className={styles.formContainer}>
      <h2>{editingStore ? 'Edit Store' : 'Add New Store'}</h2>
      <form onSubmit={onSubmit} className={styles.form}>
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
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreForm;
