'use client';

import React, { Suspense, lazy } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// Lazy load heavy components
const SearchBar = lazy(() => import('@/components/SearchBar'));

// Memoized hero section
const HeroSection = React.memo(() => (
  <section className={styles.hero}>
    <div className={styles.heroContent}>
      <h1 className={styles.heroTitle}>
        Discover Amazing Stores Near You
      </h1>
      <p className={styles.heroSubtitle}>
        Find the best local businesses, restaurants, and services in your area with our intelligent search platform. 
        Get real-time information, reviews, and directions to make your shopping experience perfect.
      </p>
      <div className={styles.heroActions}>
        <Link href="/search" className={styles.primaryButton} prefetch={false}>
          🚀 Start Searching
        </Link>
        <Link href="/register" className={styles.secondaryButton} prefetch={false}>
          ✨ Join Now
        </Link>
      </div>
    </div>
  </section>
));

HeroSection.displayName = 'HeroSection';

// Memoized features section
const FeaturesSection = React.memo(() => (
  <section className={styles.features}>
    <h2 className={styles.sectionTitle}>Why Choose Store Locator?</h2>
    <p className={styles.sectionSubtitle}>
      Experience the future of local business discovery with our cutting-edge platform
    </p>
    <div className={styles.featuresGrid}>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>🔍</div>
        <h3>Smart Search</h3>
        <p>Find exactly what you're looking for with our AI-powered search algorithm that understands context and intent.</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>📍</div>
        <h3>Precise Location</h3>
        <p>Get accurate directions and real-time location data for every store with Google Maps integration.</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>⭐</div>
        <h3>Verified Reviews</h3>
        <p>Read authentic reviews from real customers to make informed decisions about where to shop.</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>🚀</div>
        <h3>Lightning Fast</h3>
        <p>Experience blazing fast search results and smooth navigation optimized for performance.</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>📱</div>
        <h3>Mobile First</h3>
        <p>Designed for mobile devices with responsive design that works perfectly on all screen sizes.</p>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>🔒</div>
        <h3>Secure & Private</h3>
        <p>Your data is protected with enterprise-grade security and privacy controls.</p>
      </div>
    </div>
  </section>
));

FeaturesSection.displayName = 'FeaturesSection';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
