import mongoose from 'mongoose';

const farmDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farm data must belong to a user']
  },
  dataType: {
    type: String,
    required: [true, 'Please specify data type'],
    enum: {
      values: ['manual', 'sensor', 'api', 'file'],
      message: 'Data type must be manual, sensor, api, or file'
    }
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: {
      values: ['planting', 'harvest', 'input', 'weather', 'market', 'livestock', 'labor', 'equipment'],
      message: 'Invalid category'
    }
  },
  crop: {
    type: String,
    enum: ['maize', 'beans', 'coffee', 'bananas', 'tomatoes', 'potatoes', 'rice', 'wheat', 'other']
  },
  livestock: {
    type: String,
    enum: ['cattle', 'goats', 'poultry', 'pigs', 'sheep', 'fish', 'other']
  },
  fieldId: String,
  
  // Core data fields
  activity: String,
  quantity: {
    type: Number,
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'tons', 'liters', 'bags', 'units', 'hours', 'acres', 'hectares']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  revenue: {
    type: Number,
    min: [0, 'Revenue cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Date cannot be in the future'
    }
  },
  
  // Data quality metrics
  isVerified: {
    type: Boolean,
    default: false
  },
  dataHealth: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    issues: [String],
    lastChecked: Date
  },
  
  // Additional metadata
  notes: String,
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient querying
farmDataSchema.index({ userId: 1, date: -1 });
farmDataSchema.index({ userId: 1, category: 1 });
farmDataSchema.index({ userId: 1, crop: 1 });
farmDataSchema.index({ date: 1 });

// Virtual for profit calculation
farmDataSchema.virtual('profit').get(function() {
  return (this.revenue || 0) - (this.cost || 0);
});

// Static method for data health analysis
farmDataSchema.statics.calculateDataHealth = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        avgHealth: { $avg: '$dataHealth.score' },
        totalRecords: { $sum: 1 },
        verifiedRecords: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ]);
};

export default mongoose.model('FarmData', farmDataSchema);
