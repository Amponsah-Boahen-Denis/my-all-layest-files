'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './reset-password.module.css';

const ResetPassword = () => {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError('Invalid reset link');
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setFormData({ newPassword: '', confirmPassword: '' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className={styles['reset-password-container']}>
        <div className={styles['reset-password-card']}>
          <div className={styles['error-message']} role="alert">
            Invalid or expired reset link. Please request a new password reset.
          </div>
          <div className={styles['form-actions']}>
            <Link href="/forgot-password" className={styles['submit-button']}>
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['reset-password-container']}>
      <div className={styles['reset-password-card']}>
        <div className={styles['reset-password-header']}>
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>
        </div>

        {message && (
          <div className={styles['success-message']} role="alert">
            {message}
            <br />
            <small>Redirecting to login page...</small>
          </div>
        )}

        {error && (
          <div className={styles['error-message']} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['reset-password-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              required
              disabled={isLoading}
            />
            <small className={styles['help-text']}>Password must be at least 8 characters long</small>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
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
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
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

export default ResetPassword;
