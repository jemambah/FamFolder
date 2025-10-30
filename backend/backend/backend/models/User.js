import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  farmType: {
    type: String,
    required: [true, 'Please specify your farm type'],
    enum: {
      values: ['crops', 'livestock', 'mixed', 'dairy', 'poultry'],
      message: 'Farm type must be crops, livestock, mixed, dairy, or poultry'
    }
  },
  location: {
    country: { type: String, default: 'Uganda' },
    region: String,
    district: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  farmSize: {
    type: Number,
    min: [0.1, 'Farm size must be at least 0.1 acres']
  },
  subscription: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ location: 1 });

// Virtual populate farm data
userSchema.virtual('farmData', {
  ref: 'FarmData',
  foreignField: 'userId',
  localField: '_id'
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to filter sensitive data
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

export default mongoose.model('User', userSchema);
