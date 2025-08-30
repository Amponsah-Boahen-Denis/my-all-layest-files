'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

const AdminDropdown = React.memo(() => {
  return (
    <div className={styles.adminDropdown}>
      <button className={styles.adminButton}>
        Admin ⚙️
      </button>
      <div className={styles.adminMenu}>
        <Link href="/admin/dashboard" className={styles.adminLink} prefetch={false}>
          Dashboard
        </Link>
        <Link href="/admin/manage-users" className={styles.adminLink} prefetch={false}>
          Manage Users
        </Link>
        <Link href="/admin/logs" className={styles.adminLink} prefetch={false}>
          System Logs
        </Link>
      </div>
    </div>
  );
});

AdminDropdown.displayName = 'AdminDropdown';

export default AdminDropdown;
