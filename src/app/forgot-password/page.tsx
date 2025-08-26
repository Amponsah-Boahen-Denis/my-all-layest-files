'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './forgot-password.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['forgot-password-container']}>
      <div className={styles['forgot-password-card']}>
        <div className={styles['forgot-password-header']}>
          <h1>Forgot Your Password?</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {message && (
          <div className={styles['success-message']} role="alert">
            {message}
          </div>
        )}

        {error && (
          <div className={styles['error-message']} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['forgot-password-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles['form-actions']}>
            <button
              type="submit"
              disabled={isLoading}
              className={styles['submit-button']}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>
        </form>

        <div className={styles['back-to-login']}>
          <p>
            Remember your password?{' '}
            <Link href="/login" className={styles.link}>
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
