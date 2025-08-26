'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './profile.module.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.header}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
            <h1 className={styles.name}>{user?.name || 'User'}</h1>
            <p className={styles.email}>{user?.email}</p>
            <span className={styles.role}>{user?.role}</span>
      </div>

          <div className={styles.content}>
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
                <button className={styles.actionButton}>
                  <span>⚙️</span>
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className={`${styles.actionButton} ${styles.logoutButton}`}
                >
                  <span>🚪</span>
                  Logout
            </button>
              </div>
            </div>
      </div>
        </div>
    </div>
    </ProtectedRoute>
  );
};

export default ProfilePage; 