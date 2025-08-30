'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1.5rem 0 1rem 0',
      marginTop: 'auto',
      borderTop: '1px solid #34495e'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#667eea'
            }}>
              🏪 Store Locator
            </h3>
            <p style={{
              color: '#bdc3c7',
              lineHeight: '1.4',
              marginBottom: '0.5rem',
              fontSize: '0.9rem'
            }}>
              Discover amazing local businesses, restaurants, and services in your area with our intelligent search platform.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.8rem',
              marginTop: '0.5rem'
            }}>
              <a href="#" style={{
                color: '#667eea',
                fontSize: '1.2rem',
                textDecoration: 'none'
              }}>
                📘
              </a>
              <a href="#" style={{
                color: '#667eea',
                fontSize: '1.2rem',
                textDecoration: 'none'
              }}>
                🐦
              </a>
              <a href="#" style={{
                color: '#667eea',
                fontSize: '1.2rem',
                textDecoration: 'none'
              }}>
                📷
              </a>
              <a href="#" style={{
                color: '#667eea',
                fontSize: '1.2rem',
                textDecoration: 'none'
              }}>
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#ecf0f1'
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.3rem' }}>
                <Link href="/" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  🏠 Home
                </Link>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <Link href="/search" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  🔍 Search Stores
                </Link>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <Link href="/profile" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  👤 Profile & Stores
                </Link>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <Link href="/analytics" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  📊 Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#ecf0f1'
            }}>
              Features
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>
                  🔍 Smart Search
                </span>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>
                  📍 Location Services
                </span>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>
                  🗺️ Interactive Maps
                </span>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>
                  ⭐ Store Reviews
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#ecf0f1'
            }}>
              Support
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.3rem' }}>
                <a href="#" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  📧 Contact Us
                </a>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <a href="#" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  ❓ Help Center
                </a>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <a href="#" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  📋 Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: '0.3rem' }}>
                <a href="#" style={{
                  color: '#bdc3c7',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: '0.9rem'
                }}>
                  📄 Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #34495e',
          paddingTop: '1rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#95a5a6',
            marginBottom: '0.5rem',
            fontSize: '0.9rem'
          }}>
            © {currentYear} Store Locator. All rights reserved.
          </p>
          <p style={{
            color: '#7f8c8d',
            fontSize: '0.8rem'
          }}>
            Made with ❤️ for local business discovery
          </p>
        </div>
      </div>

      {/* Hover Effects */}
      <style jsx>{`
        a:hover {
          color: #667eea !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
