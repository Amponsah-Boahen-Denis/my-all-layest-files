'use client';

import { useState, useEffect } from 'react';
import styles from './manage-users.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'blocked' | 'suspended';
  lastLogin: string;
  totalSearches: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock users data - in a real app this would come from an API
      const mockUsers: User[] = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          joinDate: '2024-01-15',
          status: 'active',
          lastLogin: '2024-01-20T10:30:00Z',
          totalSearches: 42
        },
        {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          joinDate: '2024-01-10',
          status: 'active',
          lastLogin: '2024-01-20T09:15:00Z',
          totalSearches: 28
        },
        {
          id: 'user3',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          joinDate: '2024-01-05',
          status: 'blocked',
          lastLogin: '2024-01-18T14:20:00Z',
          totalSearches: 15
        },
        {
          id: 'user4',
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          joinDate: '2024-01-12',
          status: 'suspended',
          lastLogin: '2024-01-19T16:45:00Z',
          totalSearches: 8
        },
        {
          id: 'user5',
          name: 'Charlie Wilson',
          email: 'charlie.wilson@example.com',
          joinDate: '2024-01-08',
          status: 'active',
          lastLogin: '2024-01-20T11:00:00Z',
          totalSearches: 35
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      let newStatus: 'active' | 'blocked' | 'suspended';
      
      if (currentStatus === 'active') {
        newStatus = 'blocked';
      } else if (currentStatus === 'blocked') {
        newStatus = 'suspended';
      } else {
        newStatus = 'active';
      }

      // In a real app, this would make an API call to update the user status
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      alert(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // In a real app, this would make an API call to delete the user
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'blocked': return '#e74c3c';
      case 'suspended': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading users...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Users</h1>
      
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.stats}>
          <span>Total Users: {users.length}</span>
          <span>Active: {users.filter(u => u.status === 'active').length}</span>
          <span>Blocked: {users.filter(u => u.status === 'blocked').length}</span>
          <span>Suspended: {users.filter(u => u.status === 'suspended').length}</span>
        </div>
      </div>

      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>User</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Join Date</div>
          <div className={styles.headerCell}>Last Login</div>
          <div className={styles.headerCell}>Searches</div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        {filteredUsers.map((user) => (
          <div key={user.id} className={styles.userRow}>
            <div className={styles.userInfo}>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
            
            <div className={styles.statusCell}>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(user.status) }}
              >
                {user.status}
              </span>
            </div>
            
            <div className={styles.dateCell}>
              {new Date(user.joinDate).toLocaleDateString()}
            </div>
            
            <div className={styles.dateCell}>
              {new Date(user.lastLogin).toLocaleDateString()}
            </div>
            
            <div className={styles.searchesCell}>
              {user.totalSearches}
            </div>
            
            <div className={styles.actionsCell}>
              <button
                onClick={() => toggleUserStatus(user.id, user.status)}
                className={styles.actionButton}
                title={`Change status from ${user.status}`}
              >
                {user.status === 'active' ? 'Block' : 
                 user.status === 'blocked' ? 'Suspend' : 'Activate'}
              </button>
              
              <button
                onClick={() => deleteUser(user.id)}
                className={styles.deleteButton}
                title="Delete user"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className={styles.noResults}>
          <p>No users found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
} 