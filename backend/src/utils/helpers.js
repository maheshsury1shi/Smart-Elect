import crypto from 'crypto';

export const hashAadhaar = (aadhaar) => {
  return crypto.createHash('sha256').update(aadhaar).digest('hex');
};

export const generateTokenNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const calculateFaceDistance = (descriptor1, descriptor2) => {
  // Euclidean distance between two face descriptors
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};
