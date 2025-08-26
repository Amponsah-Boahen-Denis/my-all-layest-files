import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchAnalytics extends Document {
  searchQuery: string;
  location: string;
  country: string;
  productCategory?: string;
  userId?: mongoose.Types.ObjectId | string;
  userAgent?: string;
  ipAddress?: string;
  searchResults: number;
  searchTime: number; // in milliseconds
  searchSource: 'cache' | 'database' | 'google_api';
  coordinates?: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  sessionId?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
}

const SearchAnalyticsSchema = new Schema<ISearchAnalytics>({
  searchQuery: {
    type: String,
    required: [true, 'Search query is required'],
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    index: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    index: true
  },
  productCategory: {
    type: String,
    trim: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true,
    index: true
  },
  searchResults: {
    type: Number,
    required: [true, 'Search results count is required'],
    min: [0, 'Search results cannot be negative']
  },
  searchTime: {
    type: Number,
    required: [true, 'Search time is required'],
    min: [0, 'Search time cannot be negative']
  },
  searchSource: {
    type: String,
    enum: ['cache', 'database', 'google_api'],
    required: [true, 'Search source is required'],
    index: true
  },
  coordinates: {
    lat: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    trim: true,
    index: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    index: true
  },
  browser: {
    type: String,
    trim: true,
    index: true
  },
  os: {
    type: String,
    trim: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient analytics queries
SearchAnalyticsSchema.index({ searchQuery: 'text', location: 'text', country: 'text' });
SearchAnalyticsSchema.index({ timestamp: -1 });
SearchAnalyticsSchema.index({ searchSource: 1, timestamp: -1 });
SearchAnalyticsSchema.index({ productCategory: 1, timestamp: -1 });
SearchAnalyticsSchema.index({ country: 1, timestamp: -1 });
SearchAnalyticsSchema.index({ userId: 1, timestamp: -1 });

// Compound indexes for common analytics queries
SearchAnalyticsSchema.index({ country: 1, location: 1, timestamp: -1 });
SearchAnalyticsSchema.index({ productCategory: 1, country: 1, timestamp: -1 });
SearchAnalyticsSchema.index({ searchSource: 1, country: 1, timestamp: -1 });

export default mongoose.models.SearchAnalytics || mongoose.model<ISearchAnalytics>('SearchAnalytics', SearchAnalyticsSchema);
