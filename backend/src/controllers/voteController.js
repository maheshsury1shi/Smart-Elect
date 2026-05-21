import Vote from '../models/Vote.js';
import Profile from '../models/Profile.js';
import Candidate from '../models/Candidate.js';

export const castVote = async (req, res) => {
  try {
    const { profileId, candidateId } = req.body;

    // Validation
    if (!profileId || !candidateId) {
      return res.status(400).json({ message: 'Profile ID and Candidate ID are required' });
    }

    // Validate MongoDB ObjectIds
    if (!profileId.match(/^[0-9a-fA-F]{24}$/) || !candidateId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Profile ID or Candidate ID format' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create vote record
    const vote = new Vote({
      voterId: profileId,
      candidateId,
      timestamp: new Date(),
    });

    await vote.save();

    // Update vote count
    candidate.voteCount = (candidate.voteCount || 0) + 1;
    await candidate.save();

    // Mark voter as voted
    profile.hasVoted = true;
    profile.votedAt = new Date();
    await profile.save();

    res.status(201).json({
      message: 'Vote cast successfully',
      voteId: vote._id,
      candidateName: candidate.name,
      timestamp: vote.timestamp,
    });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({ message: 'Vote casting failed: ' + error.message });
  }
};

export const getAllVotes = async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate({
        path: 'voterId',
        select: 'fullName tokenNumber dateOfBirth',
        model: 'Profile',
      })
      .populate({
        path: 'candidateId',
        select: 'name party voteCount',
        model: 'Candidate',
      })
      .sort({ timestamp: -1 });

    // Format response
    const formattedVotes = votes.map(vote => ({
      _id: vote._id,
      voterId: vote.voterId,
      candidateId: vote.candidateId,
      timestamp: vote.timestamp,
      createdAt: vote.createdAt,
    }));

    res.json(formattedVotes);
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ message: 'Failed to fetch votes: ' + error.message });
  }
};
