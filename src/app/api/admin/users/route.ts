import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock users data - in a real app this would come from a database
    const mockUsers = [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: '2024-01-15',
        status: 'active',
        lastLogin: '2024-01-20T10:30:00Z',
        totalSearches: 42,
        savedLocations: 15,
        role: 'user'
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        joinDate: '2024-01-10',
        status: 'active',
        lastLogin: '2024-01-20T09:15:00Z',
        totalSearches: 28,
        savedLocations: 12,
        role: 'user'
      },
      {
        id: 'user3',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        joinDate: '2024-01-05',
        status: 'blocked',
        lastLogin: '2024-01-18T14:20:00Z',
        totalSearches: 15,
        savedLocations: 8,
        role: 'user'
      },
      {
        id: 'user4',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        joinDate: '2024-01-12',
        status: 'suspended',
        lastLogin: '2024-01-19T16:45:00Z',
        totalSearches: 8,
        savedLocations: 3,
        role: 'user'
      },
      {
        id: 'user5',
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
        joinDate: '2024-01-08',
        status: 'active',
        lastLogin: '2024-01-20T11:00:00Z',
        totalSearches: 35,
        savedLocations: 18,
        role: 'user'
      },
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        joinDate: '2024-01-01',
        status: 'active',
        lastLogin: '2024-01-20T12:00:00Z',
        totalSearches: 0,
        savedLocations: 0,
        role: 'admin'
      }
    ];

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let filteredUsers = mockUsers;

    // Filter by status
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Filter by role
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Filter by search term
    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate statistics
    const stats = {
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'active').length,
      blocked: mockUsers.filter(u => u.status === 'blocked').length,
      suspended: mockUsers.filter(u => u.status === 'suspended').length,
      users: mockUsers.filter(u => u.role === 'user').length,
      admins: mockUsers.filter(u => u.role === 'admin').length
    };

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      stats,
      totalResults: filteredUsers.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
} 