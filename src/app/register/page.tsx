'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './register.module.css';

const Register = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/profile';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Check password strength when password changes
      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    const colors = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#2f855a'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return {
      color: colors[passwordStrength - 1] || '#e2e8f0',
      text: texts[passwordStrength - 1] || 'Enter password'
    };
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && 
           /[a-z]/.test(password) && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with lowercase, uppercase, and number';
    }

    // Password confirmation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Prepare data for registration
      const userData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        acceptMarketing: formData.acceptMarketing
      };

      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Show success message and redirect
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}&message=Registration successful! Please log in.`);

    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles['register-container']}>
      <div className={styles['register-card']}>
        <div className={styles['register-header']}>
          <h1>Create Your Account</h1>
          <p>Join thousands of businesses connecting with customers</p>
          {redirectTo !== '/profile' && (
            <div className={styles['redirect-notice']}>
              <span>🔒</span>
              You'll be redirected to {redirectTo} after registration
          </div>
        )}
        </div>

        {errors.general && (
          <div className={styles['error-message']} role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['register-form']}>
          {/* Personal Information */}
          <div className={styles['form-section']}>
            <div className={styles['section-header']}>
              <div className={styles['section-icon']}>👤</div>
              <h2>Personal Information</h2>
            </div>
            
            <div className={styles['name-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? styles.error : ''}
                  placeholder="Enter your first name"
                  required
                />
                {errors.firstName && <span className={styles['error-text']}>{errors.firstName}</span>}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                onChange={handleInputChange}
                  className={errors.lastName ? styles.error : ''}
                  placeholder="Enter your last name"
                required
              />
                {errors.lastName && <span className={styles['error-text']}>{errors.lastName}</span>}
              </div>
            </div>

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
              />
              {errors.email && <span className={styles['error-text']}>{errors.email}</span>}
            </div>
          </div>

          {/* Security */}
          <div className={styles['form-section']}>
            <div className={styles['section-header']}>
              <div className={styles['section-icon']}>🔒</div>
            <h2>Security</h2>
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
                placeholder="Create a strong password"
                required
              />
                <button
                  type="button"
                  className={styles['password-toggle']}
                  onClick={() => togglePasswordVisibility('password')}
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
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className={styles['password-strength']}>
                  <div className={styles['strength-bar']}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`${styles['strength-segment']} ${
                          level <= passwordStrength ? styles.active : ''
                        }`}
                        style={{
                          backgroundColor: level <= passwordStrength ? getPasswordStrengthInfo().color : '#e2e8f0'
                        }}
                      />
                    ))}
                  </div>
                  <span className={styles['strength-text']} style={{ color: getPasswordStrengthInfo().color }}>
                    {getPasswordStrengthInfo().text}
                  </span>
                </div>
              )}
              
              {errors.password && <span className={styles['error-text']}>{errors.password}</span>}
              <small className={styles['help-text']}>
                Password must be at least 8 characters with lowercase, uppercase, and number
              </small>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className={styles['password-input-container']}>
              <input
                  type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                  className={errors.confirmPassword ? styles.error : ''}
                placeholder="Confirm your password"
                required
              />
                <button
                  type="button"
                  className={styles['password-toggle']}
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && <span className={styles['error-text']}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Terms and Preferences */}
          <div className={styles['form-section']}>
            <div className={styles['section-header']}>
              <div className={styles['section-icon']}>📋</div>
              <h2>Terms & Preferences</h2>
            </div>
            
            <div className={styles['form-group']}>
              <label className={styles['checkbox-label']}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                />
                <span className={styles.checkmark}></span>
                I accept the <Link href="/terms" className={styles.link}>Terms and Conditions</Link> and <Link href="/privacy" className={styles.link}>Privacy Policy</Link> *
              </label>
              {errors.acceptTerms && <span className={styles['error-text']}>{errors.acceptTerms}</span>}
            </div>

            <div className={styles['form-group']}>
              <label className={styles['checkbox-label']}>
                <input
                  type="checkbox"
                  name="acceptMarketing"
                  checked={formData.acceptMarketing}
                  onChange={handleInputChange}
                />
                <span className={styles.checkmark}></span>
                I would like to receive marketing communications about new features and updates
              </label>
            </div>
          </div>

          {/* Submit Button */}
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className={styles['login-link']}>
          <p>
            Already have an account?{' '}
            <Link href={`/login${redirectTo !== '/profile' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 