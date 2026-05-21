import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    default: '🎭', // Emoji or party symbol
  },
  manifesto: {
    type: String,
    default: 'A commitment to excellence and service.', // Short manifesto description
  },
  photo: {
    type: String, // URL or base64
    default: null,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Candidate', candidateSchema);
