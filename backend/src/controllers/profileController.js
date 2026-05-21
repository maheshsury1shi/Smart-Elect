import Profile from '../models/Profile.js';
import User from '../models/User.js';

export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const profile = await Profile.findOne({ userId }).populate('userId', '-password');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile: ' + error.message });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('userId', 'email')
      .select('-faceData.descriptor -faceData.image');

    res.json(profiles);
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ message: 'Failed to fetch profiles: ' + error.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Profile ID is required' });
    }

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Soft delete: deactivate the user instead of deleting
    if (profile.userId) {
      await User.findByIdAndUpdate(
        profile.userId,
        { isActive: false },
        { new: true }
      );
    }

    // Delete the profile
    await Profile.findByIdAndDelete(id);

    res.json({ message: 'Voter deleted successfully and account has been deactivated' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Failed to delete profile: ' + error.message });
  }
};

export const verifyVoterByFace = async (req, res) => {
  try {
    const { tokenNumber, aadhaarHash, fullName, dateOfBirth, faceDescriptor } = req.body;

    console.log('Verification attempt:', {
      tokenNumber,
      fullName,
      dateOfBirth,
      faceDescriptorLength: faceDescriptor?.length,
    });

    // Validation
    if (!tokenNumber || !aadhaarHash || !fullName || !dateOfBirth) {
      return res.status(400).json({ 
        message: 'All fields are required for verification',
        errorType: 'invalid_input'
      });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({ 
        message: 'Face descriptor required (128-dimensional)',
        errorType: 'invalid_face'
      });
    }

    // Parse and normalize dates - compare only the date portion
    const incomingDate = new Date(dateOfBirth);
    const incomingDateStr = `${incomingDate.getUTCFullYear()}-${String(incomingDate.getUTCMonth() + 1).padStart(2, '0')}-${String(incomingDate.getUTCDate()).padStart(2, '0')}`;

    // Normalize fullName for comparison
    const normalizedFullName = fullName.trim();

    console.log('Searching for profile:', { tokenNumber, fullName: normalizedFullName });

    // Find profile by token number and name (try exact match first, then case-insensitive)
    let profile = await Profile.findOne({ 
      tokenNumber, 
      fullName: normalizedFullName
    });

    // If not found, try case-insensitive search
    if (!profile) {
      profile = await Profile.findOne({ 
        tokenNumber,
        fullName: new RegExp(`^${normalizedFullName}$`, 'i')
      });
    }

    if (!profile) {
      console.log('Profile not found for:', { tokenNumber, fullName: normalizedFullName });
      return res.status(404).json({ 
        message: 'Voter profile not found - check token number and name',
        errorType: 'token_not_found'
      });
    }

    console.log('Profile found:', { profileId: profile._id, hasVoted: profile.hasVoted });

    // Verify DOB
    const storedDate = new Date(profile.dateOfBirth);
    const storedDateStr = `${storedDate.getUTCFullYear()}-${String(storedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(storedDate.getUTCDate()).padStart(2, '0')}`;
    
    console.log('DOB comparison:', { stored: storedDateStr, incoming: incomingDateStr });

    if (storedDateStr !== incomingDateStr) {
      return res.status(400).json({ 
        message: 'Date of birth does not match',
        errorType: 'dob_mismatch'
      });
    }

    // Verify Aadhaar
    console.log('Aadhaar comparison:', {
      stored: profile.aadhaarHash,
      incoming: aadhaarHash,
      match: profile.aadhaarHash === aadhaarHash,
      storedLength: profile.aadhaarHash.length,
      incomingLength: aadhaarHash.length
    });

    if (profile.aadhaarHash !== aadhaarHash) {
      return res.status(400).json({ 
        message: 'Aadhaar verification failed - information does not match',
        errorType: 'aadhaar_mismatch',
        debug: {
          storedHash: profile.aadhaarHash,
          incomingHash: aadhaarHash
        }
      });
    }

    // Check if already voted
    if (profile.hasVoted) {
      return res.status(400).json({ 
        message: 'This voter has already voted',
        errorType: 'already_voted'
      });
    }

    // Verify face match using Euclidean distance
    const storedDescriptor = profile.faceData.descriptor;
    
    if (!Array.isArray(storedDescriptor) || storedDescriptor.length !== 128) {
      return res.status(500).json({ 
        message: 'Invalid stored face descriptor',
        errorType: 'face_not_detected'
      });
    }

    let faceDistance = 0;
    for (let i = 0; i < 128; i++) {
      const diff = Number(storedDescriptor[i]) - Number(faceDescriptor[i]);
      faceDistance += diff * diff;
    }
    faceDistance = Math.sqrt(faceDistance);

    console.log(`Face verification - Distance: ${faceDistance}`);

    // Strict threshold: 0.4 - faces must very closely match
    // Lower = stricter matching required
    const threshold = 0.4;
    if (faceDistance > threshold) {
      console.warn(`Face distance ${faceDistance} exceeds threshold ${threshold} - REJECTION (DIFFERENT PERSON)`);
      return res.status(400).json({
        message: 'Face does not match. Your face does not match the registered photo.',
        errorType: 'face_not_matched',
        verified: false,
        distance: faceDistance.toFixed(3),
      });
    }

    console.log(`Face verification APPROVED - Distance ${faceDistance} within threshold ${threshold}`);
    res.json({
      message: 'Verification successful',
      profileId: profile._id,
      verified: true,
      distance: faceDistance.toFixed(3),
    });
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({ 
      message: 'Verification failed: ' + error.message,
      errorType: 'default'
    });
  }
};
