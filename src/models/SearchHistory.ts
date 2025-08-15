import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  country: string;
  location: string;
  productCategory: string;
  stores: Array<{
    id: string;
    name: string;
    localizedName: string;
    address: string;
    phone?: string;
    email?: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    type: string;
    relevance: number;
  }>;
  coordinates: {
    lat: number;
    lng: number;
  };
  layout: string;
  searchDate: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  query: {
    type: String,
    required: [true, 'Search query is required'],
    trim: true,
    maxlength: [200, 'Search query cannot exceed 200 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  productCategory: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  stores: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    localizedName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lon: {
        type: Number,
        required: true,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    relevance: {
      type: Number,
      required: true,
      min: [0, 'Relevance must be at least 0'],
      max: [100, 'Relevance cannot exceed 100']
    }
  }],
  coordinates: {
    lat: {
      type: Number,
      required: true,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: true,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  layout: {
    type: String,
    enum: ['grid', 'list'],
    default: 'grid'
  },
  searchDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for search summary
SearchHistorySchema.virtual('searchSummary').get(function() {
  return `${this.query} in ${this.location}, ${this.country}`;
});

// Indexes for efficient queries
SearchHistorySchema.index({ userId: 1 });
SearchHistorySchema.index({ searchDate: -1 }); // Most recent first
SearchHistorySchema.index({ query: 'text', country: 'text', location: 'text' });
SearchHistorySchema.index({ productCategory: 1 });
SearchHistorySchema.index({ userId: 1, searchDate: -1 }); // Compound index for user's search history

export default mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema); 