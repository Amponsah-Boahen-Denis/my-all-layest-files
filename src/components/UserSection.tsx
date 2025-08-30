'use client';

import React, { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navigation.module.css';

const UserSection = React.memo(({ user }: { user: any }) => {
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className={styles.userSection}>
      <span className={styles.userName}>
        Welcome, {user?.name}!
      </span>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Sign Out
      </button>
    </div>
  );
});

UserSection.displayName = 'UserSection';

export default UserSection;
