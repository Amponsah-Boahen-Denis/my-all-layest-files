'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to Store Locator</h1>
        <p className={styles.subtitle}>
          Find stores near you with our intelligent product and location search
        </p>
        
        <div className={styles.heroActions}>
          <button 
            onClick={() => router.push('/search')}
            className={styles.heroButton}
          >
            Start Searching
          </button>
          <button 
            onClick={() => router.push('/manage-stores')}
            className={styles.secondaryButton}
          >
            Manage Stores
          </button>
          <button 
            onClick={() => router.push('/analytics')}
            className={styles.secondaryButton}
          >
            View Analytics
          </button>
        </div>
      </div>
      
      <div className={styles.features}>
        <h2>Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>🔍 Smart Product Search</h3>
            <p>Find stores by product name with intelligent categorization</p>
          </div>
          <div className={styles.feature}>
            <h3>📍 Location Detection</h3>
            <p>Auto-detect your location or search anywhere in the world</p>
          </div>
          <div className={styles.feature}>
            <h3>🏪 Store Information</h3>
            <p>Get detailed store info including contact details and coordinates</p>
          </div>
          <div className={styles.feature}>
            <h3>🏪 Store Management</h3>
            <p>Add, edit, and manage your own stores with detailed information</p>
          </div>
          <div className={styles.feature}>
            <h3>📊 Analytics Dashboard</h3>
            <p>Track search patterns and popular locations with detailed insights</p>
          </div>
          <div className={styles.feature}>
            <h3>💾 Search History</h3>
            <p>Save and manage your search results for future reference</p>
          </div>
          <div className={styles.feature}>
            <h3>📱 Responsive Design</h3>
            <p>Works perfectly on all devices - desktop, tablet, and mobile</p>
          </div>
          <div className={styles.feature}>
            <h3>🌍 Global Coverage</h3>
            <p>Search stores in any country and city worldwide</p>
          </div>
        </div>
      </div>
      
      <div className={styles.cta}>
        <h2>Ready to find stores?</h2>
        <p>Start searching for products and discover stores near you!</p>
        <button 
          onClick={() => router.push('/search')}
          className={styles.ctaButton}
        >
          Start Searching
        </button>
      </div>
    </div>
  );
}
