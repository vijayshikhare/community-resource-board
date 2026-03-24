// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: 2000,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  resume: {
    filename: String,
    path: String,
    originalName: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 1000,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique application per user-resource
applicationSchema.index({ user: 1, resource: 1 }, { unique: true });

// Indexes for queries
applicationSchema.index({ resource: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });

// Virtual for frontend summary
applicationSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    user: this.user,
    resource: this.resource,
    status: this.status,
    skills: this.skills,
    coverLetter: this.coverLetter,
    createdAt: this.createdAt
  };
});

module.exports = mongoose.model('Application', applicationSchema);
