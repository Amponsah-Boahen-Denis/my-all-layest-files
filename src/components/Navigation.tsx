'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navigation.module.css';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Development Mode Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '8px',
        fontSize: '14px',
        fontWeight: '600',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        🔓 DEVELOPMENT MODE: Authentication bypassed for frontend development
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            Store Locator
          </Link>
          
          <div className={styles.links}>
            <Link href="/" className={styles.link}>
              Home
            </Link>
            <Link href="/search" className={styles.link}>
              Search
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/history" className={styles.link}>
                  History
                </Link>
                <Link href="/profile" className={styles.link}>
                  Profile
                </Link>
                {/* Admin Navigation - Only show for admin users */}
                {user?.role === 'admin' && (
                  <div className={styles.adminDropdown}>
                    <button className={styles.adminButton}>
                      Admin ⚙️
                    </button>
                    <div className={styles.adminMenu}>
                      <Link href="/admin/dashboard" className={styles.adminLink}>
                        Dashboard
                      </Link>
                      <Link href="/admin/manage-users" className={styles.adminLink}>
                        Manage Users
                      </Link>
                      <Link href="/admin/logs" className={styles.adminLink}>
                        System Logs
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.auth}>
            {isAuthenticated ? (
              <div className={styles.userSection}>
                <span className={styles.userName}>
                  Welcome, {user?.firstName}!
                </span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className={styles.loginLink}>
                  Sign In
                </Link>
                <Link href="/register" className={styles.registerLink}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation; 