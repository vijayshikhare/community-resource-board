const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ✅ compatible & widely used

// Define User schema
const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // allows nulls
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // ✅ This auto-creates { email: 1 } index—no manual needed
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [
      function requiredPassword() {
        return !this.googleId;
      },
      'Password is required',
    ],
    minlength: 6,
    select: false // ✅ hide by default
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String
  }],
  resume: {
    filename: String,
    path: String,
    uploadDate: Date
  },
  profileImage: {
    type: String,
    default: ''
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

// ✅ Indexes (removed duplicate email index—unique handles it)
userSchema.index({ role: 1 });  // ✅ Keep for role queries

// ✅ Virtual property for public profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    bio: this.bio,
    skills: this.skills,
    profileImage: this.profileImage,
    createdAt: this.createdAt
  };
});

// ✅ Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.password) return next();
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare candidate password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);