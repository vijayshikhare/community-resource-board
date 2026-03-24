// models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000
  },
  type: {
    type: String,
    required: true,
    enum: ['Training', 'Workshop', 'Internship', 'Job', 'Scholarship', 'Event', 'Course', 'Other'],
    default: 'Training'
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Education', 'Other'],
    default: 'Other'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      default: 'Remote'
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  duration: {
    type: String,
    trim: true
  },
  startDate: Date,
  endDate: Date,
  deadline: Date,
  requirements: [{ type: String, trim: true }],
  benefits: [{ type: String, trim: true }],
  skills: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  applicationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  featured: {
    type: Boolean,
    default: false
  },
  imageUrl: String,
  contactEmail: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  contactPhone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  tags: [{ type: String, trim: true }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  policyEnforcement: {
    isTerminated: {
      type: Boolean,
      default: false,
    },
    terminationReason: {
      type: String,
      trim: true,
      default: '',
    },
    terminatedAt: {
      type: Date,
    },
    terminatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastStatusBeforeTermination: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    organizerAppeal: {
      status: {
        type: String,
        enum: ['none', 'pending', 'accepted', 'rejected'],
        default: 'none',
      },
      reason: {
        type: String,
        trim: true,
        default: '',
      },
      submittedAt: {
        type: Date,
      },
      reviewedAt: {
        type: Date,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      adminResponse: {
        type: String,
        trim: true,
        default: '',
      },
    },
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search & filtering
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ type: 1, status: 1 });
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ organizer: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ featured: 1, status: 1 });

// Virtual for checking if resource is expired
resourceSchema.virtual('isExpired').get(function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline;
});

// Virtual summary for frontend
resourceSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    type: this.type,
    category: this.category,
    organizerName: this.organizerName,
    status: this.status,
    featured: this.featured,
    applicationCount: this.applicationCount,
    views: this.views,
    isExpired: this.isExpired,
    startDate: this.startDate,
    endDate: this.endDate,
    deadline: this.deadline
  };
});

module.exports = mongoose.model('Resource', resourceSchema);
