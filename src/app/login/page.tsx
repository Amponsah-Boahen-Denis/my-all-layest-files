'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './login.module.css';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/profile';
  const successMessage = searchParams.get('message');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Use authentication context
      await login(formData.email, formData.password, formData.rememberMe);
      
      // Redirect to the intended page after successful login
      router.push(redirectTo);

    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    const forgotPasswordUrl = `/forgot-password${redirectTo !== '/profile' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;
    router.push(forgotPasswordUrl);
  };

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-card']}>
        <div className={styles['login-header']}>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
          {redirectTo !== '/profile' && (
            <div className={styles['redirect-notice']}>
              <span>🔒</span>
              You'll be redirected to {redirectTo} after login
            </div>
          )}
        </div>

        {successMessage && (
          <div className={styles['success-message']} role="alert">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className={styles['error-message']} role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['login-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? styles.error : ''}
              placeholder="Enter your email address"
              required
              autoComplete="email"
            />
            {errors.email && <span className={styles['error-text']}>{errors.email}</span>}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password *</label>
            <div className={styles['password-input-container']}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? styles.error : ''}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles['password-toggle']}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className={styles['error-text']}>{errors.password}</span>}
          </div>

          <div className={styles['form-options']}>
            <label className={styles['checkbox-label']}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <span className={styles.checkmark}></span>
              Remember me
            </label>
            
            <button
              type="button"
              className={styles['forgot-password']}
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Social Login Options */}
        <div className={styles['social-login']}>
          <div className={styles.divider}>
            <span>Or continue with</span>
          </div>
          
          <div className={styles['social-buttons']}>
            <button type="button" className={`${styles['social-button']} ${styles.google}`}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <button type="button" className={`${styles['social-button']} ${styles.facebook}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className={styles['register-link']}>
          <p>
            Don't have an account?{' '}
            <Link href={`/register${redirectTo !== '/profile' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className={styles.link}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 