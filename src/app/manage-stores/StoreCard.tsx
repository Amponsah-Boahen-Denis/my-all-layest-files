'use client';

import React, { useCallback } from 'react';
import styles from './manage-stores.module.css';

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

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (storeId: string) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(store);
  }, [onEdit, store]);

  const handleDelete = useCallback(() => {
    onDelete(store._id);
  }, [onDelete, store._id]);

  return (
    <div className={styles.storeCard}>
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
        <button onClick={handleEdit} className={styles.editButton}>
          Edit
        </button>
        <button onClick={handleDelete} className={styles.deleteButton}>
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
  );
};

export default StoreCard;
