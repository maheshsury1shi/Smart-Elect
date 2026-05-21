import Candidate from '../models/Candidate.js';

export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: 1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Failed to fetch candidates: ' + error.message });
  }
};

export const addCandidate = async (req, res) => {
  try {
    const { name, party, photo, symbol, manifesto } = req.body;

    console.log('Adding candidate with data:', { name, party, symbol, manifesto });

    // Validation
    if (!name || !party || !manifesto) {
      return res.status(400).json({ message: 'Candidate name, party, and manifesto are required' });
    }

    if (name.trim().length === 0 || party.trim().length === 0 || manifesto.trim().length === 0) {
      return res.status(400).json({ message: 'Candidate name, party, and manifesto cannot be empty' });
    }

    if (manifesto.length > 250) {
      return res.status(400).json({ message: 'Manifesto must be 250 characters or less' });
    }

    // Check for duplicate
    const existing = await Candidate.findOne({ name: name.trim(), party: party.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Candidate already exists' });
    }

    const candidate = new Candidate({
      name: name.trim(),
      party: party.trim(),
      symbol: symbol || '🎭',
      manifesto: manifesto.trim(),
      photo: photo || null,
      voteCount: 0,
    });

    await candidate.save();

    console.log('Candidate saved successfully:', candidate);

    res.status(201).json({
      message: 'Candidate added successfully',
      candidate,
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({ message: 'Failed to add candidate: ' + error.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Candidate ID is required' });
    }

    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ message: 'Failed to delete candidate: ' + error.message });
  }
};
