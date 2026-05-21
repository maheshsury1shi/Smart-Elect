import Setting from '../models/Setting.js';
import Vote from '../models/Vote.js';
import Profile from '../models/Profile.js';
import Candidate from '../models/Candidate.js';

export const getResultsStatus = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'results_declared' });
    const declared = setting ? setting.value : false;

    res.json({
      declared,
      timestamp: setting?.updatedAt || new Date(),
    });
  } catch (error) {
    console.error('Get results status error:', error);
    res.status(500).json({ message: 'Failed to fetch results status: ' + error.message });
  }
};

export const declareResults = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'results_declared' });

    if (!setting) {
      setting = new Setting({
        key: 'results_declared',
        value: true,
        updatedAt: new Date(),
      });
    } else {
      setting.value = true;
      setting.updatedAt = new Date();
    }

    await setting.save();

    // Get final results
    const candidates = await Candidate.find().sort({ voteCount: -1 });
    const winner = candidates.length > 0 ? candidates[0] : null;
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    res.json({
      message: 'Results declared successfully',
      winner,
      totalVotes,
      declarationTime: setting.updatedAt,
    });
  } catch (error) {
    console.error('Declare results error:', error);
    res.status(500).json({ message: 'Failed to declare results: ' + error.message });
  }
};

export const resetElection = async (req, res) => {
  try {
    // Delete all votes
    const votesDeleted = await Vote.deleteMany({});

    // Reset vote counts
    const candidatesUpdated = await Candidate.updateMany({}, { voteCount: 0 });

    // Reset hasVoted flags and votedAt timestamps
    const profilesUpdated = await Profile.updateMany({}, { hasVoted: false, votedAt: null });

    // Reset results_declared
    let setting = await Setting.findOne({ key: 'results_declared' });
    if (setting) {
      setting.value = false;
      setting.updatedAt = new Date();
      await setting.save();
    } else {
      setting = new Setting({
        key: 'results_declared',
        value: false,
        updatedAt: new Date(),
      });
      await setting.save();
    }

    res.json({
      message: 'Election reset successfully',
      votesDeleted: votesDeleted.deletedCount,
      candidatesUpdated: candidatesUpdated.modifiedCount,
      profilesUpdated: profilesUpdated.modifiedCount,
    });
  } catch (error) {
    console.error('Reset election error:', error);
    res.status(500).json({ message: 'Failed to reset election: ' + error.message });
  }
};

export const getResults = async (req, res) => {
  try {
    // Check if results are declared
    const setting = await Setting.findOne({ key: 'results_declared' });
    if (!setting || !setting.value) {
      return res.status(403).json({ message: 'Results have not been declared yet' });
    }

    const candidates = await Candidate.find().sort({ voteCount: -1 });
    const winner = candidates.length > 0 ? candidates[0] : null;
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    // Calculate percentages
    const candidatesWithPercentage = candidates.map(c => ({
      ...c.toObject(),
      percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(2) : 0,
    }));

    res.json({
      winner,
      candidates: candidatesWithPercentage,
      totalVotes,
      totalCandidates: candidates.length,
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Failed to fetch results: ' + error.message });
  }
};
