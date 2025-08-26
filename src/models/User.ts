import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken {
  tokenId: string;
  token: string;
  expiresAt: Date;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: string;
  lastLoginAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens?: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  tokenId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLoginAt: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  refreshTokens: [RefreshTokenSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for email queries
UserSchema.index({ email: 1 });

// Index for active users
UserSchema.index({ isActive: 1 });

// Index for password reset tokens
UserSchema.index({ resetPasswordToken: 1 });

// Index for refresh tokens
UserSchema.index({ 'refreshTokens.tokenId': 1 });

// Method to clean expired refresh tokens
UserSchema.methods.cleanExpiredTokens = function() {
  if (this.refreshTokens) {
    this.refreshTokens = this.refreshTokens.filter(
      (token: IRefreshToken) => new Date(token.expiresAt) > new Date()
    );
  }
  return this;
};

// Pre-save middleware to clean expired tokens
UserSchema.pre('save', function(next) {
  this.cleanExpiredTokens();
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 