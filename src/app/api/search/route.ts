import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }

    // Mock location data
    const mockLocations = [
      {
        id: '1',
        name: 'Central Park',
        address: 'Manhattan, NY 10024',
        type: 'Park',
        rating: 4.8,
        distance: '0.5 miles',
        coordinates: { lat: 40.7829, lng: -73.9654 },
        description: 'A large public park in Manhattan, New York City.',
        amenities: ['Walking trails', 'Playgrounds', 'Lakes', 'Zoo'],
        images: ['central-park-1.jpg', 'central-park-2.jpg']
      },
      {
        id: '2',
        name: 'Times Square',
        address: 'Manhattan, NY 10036',
        type: 'Tourist Attraction',
        rating: 4.2,
        distance: '1.2 miles',
        coordinates: { lat: 40.7580, lng: -73.9855 },
        description: 'A major commercial intersection and tourist destination.',
        amenities: ['Shopping', 'Entertainment', 'Restaurants', 'Hotels'],
        images: ['times-square-1.jpg', 'times-square-2.jpg']
      },
      {
        id: '3',
        name: 'Brooklyn Bridge',
        address: 'Brooklyn, NY 11201',
        type: 'Landmark',
        rating: 4.6,
        distance: '2.1 miles',
        coordinates: { lat: 40.7061, lng: -73.9969 },
        description: 'A hybrid cable-stayed/suspension bridge spanning the East River.',
        amenities: ['Walking path', 'Bike lane', 'Scenic views', 'Historical site'],
        images: ['brooklyn-bridge-1.jpg', 'brooklyn-bridge-2.jpg']
      },
      {
        id: '4',
        name: 'Statue of Liberty',
        address: 'Liberty Island, NY 10004',
        type: 'Monument',
        rating: 4.7,
        distance: '3.5 miles',
        coordinates: { lat: 40.6892, lng: -74.0445 },
        description: 'A colossal neoclassical sculpture on Liberty Island.',
        amenities: ['Museum', 'Observation deck', 'Guided tours', 'Gift shop'],
        images: ['statue-liberty-1.jpg', 'statue-liberty-2.jpg']
      },
      {
        id: '5',
        name: 'Empire State Building',
        address: 'Manhattan, NY 10001',
        type: 'Skyscraper',
        rating: 4.5,
        distance: '0.8 miles',
        coordinates: { lat: 40.7484, lng: -73.9857 },
        description: 'A 102-story Art Deco skyscraper in Midtown Manhattan.',
        amenities: ['Observation deck', 'Museum', 'Gift shop', 'Restaurant'],
        images: ['empire-state-1.jpg', 'empire-state-2.jpg']
      }
    ];

    // Mock search logic - filter locations based on query
    const filteredLocations = mockLocations.filter(location =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.address.toLowerCase().includes(query.toLowerCase()) ||
      location.type.toLowerCase().includes(query.toLowerCase()) ||
      location.description.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      query,
      results: filteredLocations,
      totalResults: filteredLocations.length,
      searchTime: '0.3s'
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 