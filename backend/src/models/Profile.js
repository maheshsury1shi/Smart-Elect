import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  aadhaarHash: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  tokenNumber: {
    type: String,
    unique: true,
    required: true,
  },
  faceData: {
    image: {
      type: String, // base64 encoded image
      required: true,
    },
    descriptor: {
      type: [Number], // 128-dimensional array
      required: true,
    },
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    street: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    zipCode: {
      type: String,
      required: false,
      trim: true,
    },
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
  votedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Profile', profileSchema);
