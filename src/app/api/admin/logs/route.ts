import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock logs data - in a real app this would come from a logging system
    const mockLogs = [
      {
        id: '1',
        timestamp: '2024-01-20T10:30:00Z',
        level: 'info',
        category: 'auth',
        message: 'User login successful',
        userId: 'user123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123'
      },
      {
        id: '2',
        timestamp: '2024-01-20T10:25:00Z',
        level: 'info',
        category: 'search',
        message: 'Location search performed: "Central Park"',
        userId: 'user456',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'sess_def456'
      },
      {
        id: '3',
        timestamp: '2024-01-20T10:20:00Z',
        level: 'warning',
        category: 'auth',
        message: 'Failed login attempt for email: unknown@example.com',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        sessionId: null
      },
      {
        id: '4',
        timestamp: '2024-01-20T10:15:00Z',
        level: 'info',
        category: 'user',
        message: 'New user registration: jane.doe@example.com',
        userId: 'user789',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_ghi789'
      },
      {
        id: '5',
        timestamp: '2024-01-20T10:10:00Z',
        level: 'error',
        category: 'system',
        message: 'Database connection timeout',
        ipAddress: '192.168.1.1',
        userAgent: 'System/1.0',
        sessionId: null
      },
      {
        id: '6',
        timestamp: '2024-01-20T10:05:00Z',
        level: 'debug',
        category: 'search',
        message: 'Search query cache miss',
        userId: 'user101',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        sessionId: 'sess_jkl101'
      },
      {
        id: '7',
        timestamp: '2024-01-20T10:00:00Z',
        level: 'info',
        category: 'user',
        message: 'User profile updated: user202',
        userId: 'user202',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0',
        sessionId: 'sess_mno202'
      },
      {
        id: '8',
        timestamp: '2024-01-20T09:55:00Z',
        level: 'warning',
        category: 'search',
        message: 'Rate limit exceeded for IP: 192.168.1.106',
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: null
      }
    ];

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredLogs = mockLogs;

    // Filter by level
    if (level && level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    // Filter by search term
    if (search) {
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        (log.userId && log.userId.toLowerCase().includes(search.toLowerCase())) ||
        (log.ipAddress && log.ipAddress.includes(search))
      );
    }

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      total: mockLogs.length,
      info: mockLogs.filter(l => l.level === 'info').length,
      warning: mockLogs.filter(l => l.level === 'warning').length,
      error: mockLogs.filter(l => l.level === 'error').length,
      debug: mockLogs.filter(l => l.level === 'debug').length,
      auth: mockLogs.filter(l => l.category === 'auth').length,
      search: mockLogs.filter(l => l.category === 'search').length,
      user: mockLogs.filter(l => l.category === 'user').length,
      system: mockLogs.filter(l => l.category === 'system').length
    };

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      stats,
      pagination: {
        total: filteredLogs.length,
        limit,
        offset,
        hasMore: offset + limit < filteredLogs.length
      }
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch logs' 
      },
      { status: 500 }
    );
  }
} 