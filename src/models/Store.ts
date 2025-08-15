import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  storeName: string;
  storeType: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  hours?: string;
  rating?: number;
  tags?: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  storeType: {
    type: String,
    required: [true, 'Store type is required'],
    enum: {
      values: ['electronics', 'clothing', 'supermarket', 'books', 'furniture', 'pharmacy', 'sports', 'toys', 'hardware', 'automotive', 'beauty', 'household', 'computing', 'gardening', 'pets', 'baby', 'jewelry', 'retail', 'restaurant', 'service', 'healthcare', 'education', 'entertainment', 'technology', 'other'],
      message: 'Please select a valid store type'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s-+()]*$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL starting with http:// or https://']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  hours: {
    type: String,
    trim: true,
    maxlength: [100, 'Hours cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
StoreSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.country}`;
});

// Indexes for efficient queries
StoreSchema.index({ storeName: 'text', address: 'text', country: 'text' });
StoreSchema.index({ storeType: 1 });
StoreSchema.index({ country: 1 });
StoreSchema.index({ coordinates: '2dsphere' }); // For geospatial queries
StoreSchema.index({ isActive: 1 });
StoreSchema.index({ createdBy: 1 });

// Compound index for location-based searches
StoreSchema.index({ storeType: 1, country: 1, isActive: 1 });

export default mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema); 