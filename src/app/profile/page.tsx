'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './profile.module.css';

const Profile = () => {
  // State for form inputs, store list, and UI controls
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [stores, setStores] = useState([]);
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'stores'
  const itemsPerPage = 10;

  // Mapping to ensure valid storeType values (aligned with SearchBar.jsx)
  const categoryMapping = {
    electronics: 'Tech',
    clothing: 'Apparel',
    supermarket: 'Grocery',
    books: 'Books',
    furniture: 'Furniture',
    pharmacy: 'Pharmacy',
    sports: 'Sports',
    toys: 'Toys',
    hardware: 'Hardware',
    automotive: 'Automotive',
    beauty: 'Beauty',
    household: 'Household',
    computing: 'Computing',
    gardening: 'Gardening',
    pets: 'Pets',
    baby: 'Baby',
    jewelry: 'Jewelry',
  };
  const storeTypes = Object.values(categoryMapping).sort();

  // List of common countries for dropdown
  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'India',
    'China',
    'Japan',
    'Brazil',
  ].sort();

  // Fetch stores
  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/stores', {
        params: {
          page,
          limit: itemsPerPage,
          search: searchQuery,
        },
      });
      setStores(response.data.stores);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to fetch stores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  // Fetch stores on mount and when page or searchQuery changes
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !email || emailRegex.test(email);
  };

  // Validate phone format (basic check for digits and common separators)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s-+()]*$/;
    return !email || phoneRegex.test(phone);
  };

  // Validate website format (basic URL check)
  const validateWebsite = (website: string) => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return !website || urlRegex.test(website);
  };

  // Handle form submission for adding or editing a store
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate compulsory fields
    if (!storeName.trim() || !storeType || !address.trim() || !country) {
      setError('Store Name, Store Type, Address, and Country are required.');
      return;
    }

    // Validate optional fields
    if (email && !validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }
    if (phone && !validatePhone(phone)) {
      setError('Invalid phone number format.');
      return;
    }
    if (website && !validateWebsite(website)) {
      setError('Invalid website URL.');
      return;
    }

    // Use inputs directly (sanitization removed)
    const sanitizedStoreName = storeName;
    const sanitizedAddress = address;
    const sanitizedPhone = phone;
    const sanitizedEmail = email;
    const sanitizedWebsite = website;
    const sanitizedCountry = country;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingStoreId) {
        // Update existing store
        await axios.put(`/api/stores/${editingStoreId}`, {
          storeName: sanitizedStoreName,
          storeType,
          address: sanitizedAddress,
          phone: sanitizedPhone,
          email: sanitizedEmail,
          website: sanitizedWebsite,
          country: sanitizedCountry,
        });
        setSuccess('Store updated successfully.');
      } else {
        // Add new store
        await axios.post('/api/stores', {
          storeName: sanitizedStoreName,
          storeType,
          address: sanitizedAddress,
          phone: sanitizedPhone,
          email: sanitizedEmail,
          website: sanitizedWebsite,
          country: sanitizedCountry,
        });
        setSuccess('Store added successfully.');
      }
      // Reset form
      setStoreName('');
      setStoreType('');
      setAddress('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setCountry('');
      setEditingStoreId(null);
      fetchStores(); // Refresh store list
    } catch (error: any) {
      setError(error.response?.data?.error || (editingStoreId ? 'Failed to update store.' : 'Failed to add store.'));
    } finally {
      setIsLoading(false);
    }
  }, [storeName, storeType, address, phone, email, website, country, editingStoreId, fetchStores]);

  // Handle edit button click
  const handleEdit = useCallback((store: any) => {
    setStoreName(store.storeName);
    setStoreType(store.storeType);
    setAddress(store.address);
    setPhone(store.phone || '');
    setEmail(store.email || '');
    setWebsite(store.website || '');
    setCountry(store.country || '');
    setEditingStoreId(store.id);
    setError(null);
    setSuccess(null);
    setActiveTab('stores'); // Switch to stores tab when editing
  }, []);

  // Handle delete button click
  const handleDelete = useCallback(async (storeId: string) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`/api/stores/${storeId}`);
      setSuccess('Store deleted successfully.');
      fetchStores(); // Refresh store list
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete store.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStores]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  // Reset form when canceling edit
  const handleCancelEdit = useCallback(() => {
    setStoreName('');
    setStoreType('');
    setAddress('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setCountry('');
    setEditingStoreId(null);
    setError(null);
    setSuccess(null);
  }, []);

  // Render the profile page
  return (
    <div className={styles.profileContainer}>
      {/* Development Mode Indicator */}
      <div className={styles.devModeBanner}>
        🔓 DEVELOPMENT MODE: Profile page accessible without authentication
      </div>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>Developer User</h1>
          <p className={styles.profileEmail}>dev@example.com</p>
          <p className={styles.profileRole}>Full Access User</p>
        </div>
        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stores.length}</span>
            <span className={styles.statLabel}>Stores</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>Active</span>
            <span className={styles.statLabel}>Status</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className={styles.tabIcon}>👤</span>
          Profile Information
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'stores' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          <span className={styles.tabIcon}>🏪</span>
          Store Management
        </button>
      </div>

      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className={styles.tabContent}>
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👤</span>
              Personal Information
            </h2>
            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <label>First Name</label>
                <input type="text" value="Developer" disabled className={styles.disabledInput} />
              </div>
              <div className={styles.profileField}>
                <label>Last Name</label>
                <input type="text" value="User" disabled className={styles.disabledInput} />
              </div>
              <div className={styles.profileField}>
                <label>Email</label>
                <input type="email" value="dev@example.com" disabled className={styles.disabledInput} />
              </div>
              <div className={styles.profileField}>
                <label>User ID</label>
                <input type="text" value="dev-user-123" disabled className={styles.disabledInput} />
              </div>
            </div>
          </div>


        </div>
      )}

      {/* Stores Tab Content */}
      {activeTab === 'stores' && (
        <div className={styles.tabContent}>
          {/* Store Form */}
          <div className={styles.storeFormSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>➕</span>
              {editingStoreId ? 'Edit Store' : 'Add New Store'}
            </h2>
            
            <form className={styles.storeForm} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="storeName">Store Name *</label>
          <input
            id="storeName"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Enter store name"
            required
                    className={styles.formInput}
          />
        </div>

                <div className={styles.formField}>
                  <label htmlFor="storeType">Store Type *</label>
          <select
            id="storeType"
            value={storeType}
            onChange={(e) => setStoreType(e.target.value)}
            required
                    className={styles.formSelect}
          >
            <option value="">Select store type</option>
            {storeTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

                <div className={styles.formField}>
                  <label htmlFor="address">Address *</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address"
            required
                    className={styles.formInput}
          />
        </div>

                <div className={styles.formField}>
                  <label htmlFor="country">Country *</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
                    className={styles.formSelect}
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

                <div className={styles.formField}>
                  <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
                    className={styles.formInput}
          />
        </div>

                <div className={styles.formField}>
                  <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={styles.formInput}
          />
        </div>

                <div className={styles.formField}>
                  <label htmlFor="website">Website</label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className={styles.formInput}
          />
                </div>
        </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className={styles.submitButton}
                >
            {isLoading ? (
              <>
                      <span className={styles.spinner}></span>
                {editingStoreId ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              editingStoreId ? 'Update Store' : 'Add Store'
            )}
          </button>
          {editingStoreId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    disabled={isLoading}
                    className={styles.cancelButton}
                  >
              Cancel Edit
            </button>
          )}
        </div>

              {error && <div className={styles.errorMessage} role="alert">{error}</div>}
              {success && <div className={styles.successMessage} role="alert">{success}</div>}
      </form>
          </div>

          {/* Store List */}
          <div className={styles.storeListSection}>
            <div className={styles.listHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📋</span>
                Store Inventory
              </h2>
              <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
                  placeholder="Search stores..."
                  className={styles.searchInput}
          />
              </div>
        </div>

        {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading stores...</p>
              </div>
        ) : stores.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏪</div>
                <h3>No stores found</h3>
                <p>Start by adding your first store above</p>
              </div>
        ) : (
          <>
                <div className={styles.storeGrid}>
                {stores.map((store: any) => (
                    <div key={store.id} className={styles.storeCard}>
                      <div className={styles.storeHeader}>
                        <h3 className={styles.storeName}>{store.storeName}</h3>
                        <span className={styles.storeType}>{store.storeType}</span>
                      </div>
                      <div className={styles.storeDetails}>
                        <p className={styles.storeAddress}>📍 {store.address}</p>
                        <p className={styles.storeCountry}>🌍 {store.country}</p>
                        {store.phone && <p className={styles.storePhone}>📞 {store.phone}</p>}
                        {store.email && <p className={styles.storeEmail}>✉️ {store.email}</p>}
                        {store.website && (
                          <a href={store.website} target="_blank" rel="noopener noreferrer" className={styles.storeWebsite}>
                            🌐 Visit Website
                          </a>
                        )}
                      </div>
                      <div className={styles.storeActions}>
                      <button
                        onClick={() => handleEdit(store)}
                          className={styles.editButton}
                      >
                          ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                          className={styles.deleteButton}
                      >
                          🗑️ Delete
                      </button>
                      </div>
                    </div>
                ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={styles.paginationButton}
              >
                      ← Previous
              </button>
                    <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={styles.paginationButton}
              >
                      Next →
              </button>
            </div>
                )}
          </>
        )}
      </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 