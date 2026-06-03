import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Setting from '../models/Setting.js';
import { generateToken } from '../utils/jwt.js';
import { hashAadhaar, generateTokenNumber } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, aadhaar, dateOfBirth, gender, faceImage, faceDescriptor, phone, address } = req.body;

    // Validation
    if (!email || !password || !fullName || !aadhaar || !dateOfBirth || !gender) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate gender
    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender. Must be Male, Female, or Other' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
      return res.status(400).json({ message: 'Aadhaar must be exactly 12 digits' });
    }

    // Validate age (18+)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return res.status(400).json({ message: 'Must be 18 years or older to register' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if Aadhaar already registered
    const aadhaarHash = hashAadhaar(aadhaar);
    const existingAadhaar = await Profile.findOne({ aadhaarHash });
    if (existingAadhaar) {
      return res.status(400).json({ message: 'Aadhaar number already registered' });
    }

    // Validate face image and descriptor
    if (!faceImage) {
      return res.status(400).json({ message: 'Face image is required' });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({ message: 'Invalid face descriptor' });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role: 'user',
    });

    const savedUser = await user.save();

    // Generate token number
    const tokenNumber = generateTokenNumber();

    // Create profile with face data - trim fullName for consistency
    const profile = new Profile({
      userId: savedUser._id,
      fullName: fullName.trim(),
      aadhaarHash,
      dateOfBirth,
      gender,
      tokenNumber,
      phone,
      address: {
        street: address?.street?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        zipCode: address?.zipCode?.trim() || '',
      },
      faceData: {
        image: faceImage,
        descriptor: faceDescriptor,
      },
    });

    await profile.save();

    console.log('Profile created during registration:', {
      tokenNumber: profile.tokenNumber,
      fullName: profile.fullName,
      profileId: profile._id,
      userId: savedUser._id
    });

    const token = generateToken(savedUser._id, savedUser.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      tokenNumber,
      userId: savedUser._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated by admin' });
    }

    // Check if results are declared and user is not admin
    if (user.role === 'user') {
      const setting = await Setting.findOne({ key: 'results_declared' });
      if (setting && setting.value === true) {
        return res.status(403).json({ message: 'Election results have been declared. Voting is closed' });
      }
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ userId: req.userId });

    res.json({
      user,
      profile,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to fetch user: ' + error.message });
  }
};

export const voterLogin = async (req, res) => {
  try {
    const { email, password, dateOfBirth } = req.body;

    // Validation
    if (!email || !password || !dateOfBirth) {
      return res.status(400).json({ message: 'Email, password, and date of birth are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify date of birth matches
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Voter profile not found' });
    }

    const profileDOB = new Date(profile.dateOfBirth).toISOString().split('T')[0];
    const providedDOB = new Date(dateOfBirth).toISOString().split('T')[0];

    if (profileDOB !== providedDOB) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error('Voter login error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
};

export const getVoterProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Voter profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get voter profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile: ' + error.message });
  }
};
