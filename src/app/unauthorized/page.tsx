'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './unauthorized.module.css';

const UnauthorizedPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          🚫
        </div>
        
        <h1 className={styles.title}>Access Denied</h1>
        
        <p className={styles.message}>
          Sorry, you don't have permission to access this page. 
          Please contact an administrator if you believe this is an error.
        </p>
        
        <div className={styles.actions}>
          <button 
            onClick={handleGoBack}
            className={`${styles.button} ${styles.secondary}`}
          >
            Go Back
          </button>
          
          <button 
            onClick={handleGoHome}
            className={`${styles.button} ${styles.primary}`}
          >
            Go Home
          </button>
        </div>
        
        <div className={styles.links}>
          <Link href="/profile" className={styles.link}>
            View Profile
          </Link>
          
          <Link href="/contact" className={styles.link}>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
