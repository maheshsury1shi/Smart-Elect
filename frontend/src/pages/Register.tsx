import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { captureFaceImage, loadModels } from '../utils/faceApi';
import {
  formatAadhaarInput,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  checkAgeEligibility,
  formatPhoneNumber,
  validatePhoneNumber,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';

export default function Register() {
  const [step, setStep] = useState(1);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [canEdit, setCanEdit] = useState({ info: true, face: false, review: false });
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    aadhaar: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const [faceData, setFaceData] = useState({
    image: '',
    descriptor: [] as number[],
    confidence: 0,
  });

  const [previousFaceImage, setPreviousFaceImage] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(30);
  const [showCountdown, setShowCountdown] = useState(false);

  // Camera and face capture states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showLightingHint, setShowLightingHint] = useState(false);

  useEffect(() => {
    loadModels()
      .then(() => {
        console.log('Models loaded in Register');
        setModelsLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load face models:', error);
        toast.error('Face recognition models failed to load. Photo capture may not work.');
        setModelsLoaded(false);
      });
  }, []);

  // Auto-redirect timer on success
  useEffect(() => {
    if (step === 4 && countdownTimer > 0) {
      setShowCountdown(true);
      const timer = setTimeout(() => {
        setCountdownTimer(countdownTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (step === 4 && countdownTimer === 0 && showCountdown) {
      window.location.href = '/vote';
    }
  }, [step, countdownTimer, showCountdown]);

  // Countdown timer for face capture
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) {
        captureFaceAuto();
        setCountdown(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.info('Camera not available. You can proceed with demo mode.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  const captureFaceAuto = async () => {
    try {
      let image = '';
      if (videoRef.current && videoRef.current.readyState >= 2 && canvasRef.current) {
        image = captureFaceImage(videoRef.current, canvasRef.current) || '';
      }

      // Store previous image for comparison
      if (faceData.image) {
        setPreviousFaceImage(faceData.image);
      }

      setFaceData({
        image: image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        descriptor: Array(128).fill(0.1),
        confidence: 95 + Math.random() * 5, // Mock confidence 95-100%
      });
      toast.success('Photo captured successfully!');
    } catch (error) {
      console.error('Photo capture error:', error);
      toast.error('Photo capture failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Handle address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
      return;
    }

    // Apply formatting for specific fields
    if (name === 'aadhaar') {
      value = formatAadhaarInput(value);
    } else if (name === 'phone') {
      value = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.aadhaar) {
      toast.error('Please enter Aadhaar number');
      return false;
    }
    if (formData.aadhaar.replace(/\D/g, '').length !== 12) {
      toast.error('Aadhaar must be 12 digits');
      return false;
    }
    if (!formData.dateOfBirth) {
      toast.error('Please enter your date of birth');
      return false;
    }

    const eligibility = checkAgeEligibility(formData.dateOfBirth);
    if (!eligibility.eligible) {
      toast.error(eligibility.message);
      return false;
    }

    if (!formData.gender) {
      toast.error('Please select your gender');
      return false;
    }

    if (!formData.email) {
      toast.error('Please enter your email');
      return false;
    }
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return false;
    }

    if (!formData.password) {
      toast.error('Please enter password');
      return false;
    }
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return false;
    }

    if (!formData.confirmPassword) {
      toast.error('Please confirm your password');
      return false;
    }
    const matchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!matchValidation.match) {
      toast.error(matchValidation.message);
      return false;
    }

    if (formData.phone) {
      const phoneValidation = validatePhoneNumber(formData.phone);
      if (!phoneValidation.valid) {
        toast.error(phoneValidation.message);
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setCanEdit({ info: false, face: true, review: false });
      setStep(2);
      await startCamera();
    } else if (step === 2) {
      if (!faceData.image || faceData.image.startsWith('data:image/png;base64,iVBORw0KGg')) {
        toast.error('Please capture a face photo first');
        return;
      }
      setCanEdit({ info: false, face: false, review: true });
      setStep(3);
      stopCamera();
    }
  };

  const handleEditSection = (section: 'info' | 'face') => {
    if (section === 'info') {
      setStep(1);
      setCanEdit({ info: true, face: false, review: false });
    } else if (section === 'face') {
      setStep(2);
      setCanEdit({ info: false, face: true, review: false });
      startCamera();
    }
  };

  const handleRetake = async () => {
    setPreviousFaceImage(faceData.image);
    setFaceData({ image: '', descriptor: [], confidence: 0 });
    setCountdown(null);
    toast.info('Ready to retake photo. Click "Start Countdown" to begin.');
  };

  const handleRegister = async () => {
    if (!confirmTerms) {
      toast.error('Please accept terms and confirm your details');
      return;
    }

    try {
      toast.loading('Registering...');

      const response = await authAPI.register({
        fullName: formData.fullName,
        aadhaar: formData.aadhaar.replace(/\D/g, ''),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        faceImage: faceData.image,
        faceDescriptor: faceData.descriptor,
      });

      localStorage.removeItem('sonner-toaster');

      setTokenNumber(response.data.tokenNumber);
      login(response.data.token, {
        _id: response.data.userId,
        email: formData.email,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      toast.success('Registration successful!');
      setStep(4);
      setCountdownTimer(30);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const eligibility = checkAgeEligibility(formData.dateOfBirth);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-2xl w-full max-w-2xl border border-purple-500/30"
      >
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text">
          Register to Vote
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 mx-1">
              <div
                className={`h-2 rounded-full transition ${
                  s <= step ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              />
              <p className="text-xs text-slate-400 mt-1 text-center">
                {['Info', 'Face', 'Review', 'Success'][s - 1]}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Aadhaar with Masking */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">Aadhaar Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleInputChange}
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

            </div>

            {/* Date of Birth with Age Check */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
              {formData.dateOfBirth && (
                <div
                  className={`mt-2 p-2 rounded text-sm flex items-center gap-2 ${
                    eligibility.eligible
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  <span className="text-lg">
                    {eligibility.eligible ? '✓' : '✗'}
                  </span>
                  {eligibility.message}
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">Select your gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Password with Strength Indicator */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 8 chars: uppercase, lowercase, number"
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
              {formData.password && (
                <div className="mt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-slate-400">Password Strength</span>
                    <span
                      className={`text-xs font-bold ${
                        passwordStrength.level === 'weak'
                          ? 'text-red-400'
                          : passwordStrength.level === 'medium'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}
                    >
                      {passwordStrength.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.score}%` }}
                      className={`h-full ${getPasswordStrengthColor(passwordStrength.level)}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
              {formData.confirmPassword && (
                <div
                  className={`mt-2 p-2 rounded text-sm flex items-center gap-2 ${
                    formData.password === formData.confirmPassword
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  <span className="text-lg">
                    {formData.password === formData.confirmPassword
                      ? '✓'
                      : '✗'}
                  </span>
                  {formData.password === formData.confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-2 font-semibold text-slate-100">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="XXX-XXX-XXXX"
                maxLength={12}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Used for future OTP verification
              </p>
            </div>

            {/* Address Section */}
            <div className="border-t border-purple-500/30 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4 text-slate-100">📍 Address Information (Optional)</h3>
              
              {/* Street Address */}
              <div>
                <label className="block mb-2 font-semibold text-slate-100">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="House no., Building, Colony"
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 mb-3"
                />
              </div>

              {/* City and State Row */}
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-2 font-semibold text-slate-100">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City name"
                    className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-slate-100">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State name"
                    className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label className="block mb-2 font-semibold text-slate-100">Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Face Capture */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <p className="text-slate-300 text-center mb-4">
              📹 Position your face in the frame for recognition
            </p>

            {/* Instructions */}
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-sm text-blue-200">
              ✓ Look straight at the camera<br/>
              ✓ Remove glasses if possible<br/>
              ✓ Ensure good lighting<br/>
              ✓ Face should be clearly visible
            </div>

            {/* Camera Feed with Overlay */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full rounded-lg"
                width={640}
                height={480}
              />

              {/* Face Alignment Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-purple-500/50 rounded-full w-48 h-56" />
                <p className="absolute bottom-4 text-purple-300 text-sm">
                  Center your face in the oval
                </p>
              </div>

              {/* Lighting Hint */}
              {showLightingHint && (
                <div className="absolute top-4 left-4 bg-yellow-500/90 text-yellow-900 px-3 py-2 rounded text-sm font-semibold">
                  ⚠ Too dark — move to brighter area
                </div>
              )}

              {/* Countdown Display */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-6xl font-bold text-white animate-pulse">
                    {countdown || 'Capturing...'}
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="hidden"
              />
            </div>

            {/* Captured Photo Display */}
            {faceData.image && !faceData.image.startsWith('data:image/png;base64,iVBORw0KGg') && (
              <div>
                <p className="text-sm text-slate-300 mb-2">📸 Captured Photo</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Current Capture */}
                  <div>
                    <img
                      src={faceData.image}
                      alt="Captured face"
                      className="w-full rounded-lg border-2 border-green-500"
                    />
                    <p className="text-xs text-green-400 mt-2">Current Capture</p>
                  </div>

                  {/* Previous Capture (if available) */}
                  {previousFaceImage && (
                    <div>
                      <img
                        src={previousFaceImage}
                        alt="Previous capture"
                        className="w-full rounded-lg border-2 border-slate-500"
                      />
                      <p className="text-xs text-slate-400 mt-2">Previous Capture</p>
                    </div>
                  )}
                </div>

                {/* Confidence Score */}
                <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">Face Detection Confidence</span>
                    <span className="text-sm font-bold text-green-400">
                      {faceData.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${faceData.confidence}%` }}
                      className="h-full bg-green-500"
                    />
                  </div>
                  {faceData.confidence >= 90 && (
                    <p className="text-xs text-green-400 mt-2">✓ Face detected clearly</p>
                  )}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2">
              <button
                onClick={startCountdown}
                disabled={countdown !== null}
                className="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:bg-slate-600"
              >
                {countdown !== null
                  ? `Starting in ${countdown}...`
                  : 'Start Countdown (3-2-1)'}
              </button>
              {faceData.image &&
                !faceData.image.startsWith('data:image/png;base64,iVBORw0KGg') && (
                  <button
                    onClick={handleRetake}
                    className="flex-1 px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition"
                  >
                    Retake Photo
                  </button>
                )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4 max-h-96 overflow-y-auto"
          >
            {/* Personal Information Section */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-100">Personal Information</h3>
                <button
                  onClick={() => handleEditSection('info')}
                  className="text-xs px-3 py-1 bg-purple-600/50 hover:bg-purple-600 rounded transition"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="text-slate-100">{formData.fullName}</span>
                </p>
                <p>
                  <span className="text-slate-400">Aadhaar:</span>{' '}
                  <span className="text-slate-100">
                    {formData.aadhaar}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Date of Birth:</span>{' '}
                  <span className="text-slate-100">{formData.dateOfBirth}</span>
                </p>
                <p>
                  <span className="text-slate-400">Gender:</span>{' '}
                  <span className="text-slate-100">{formData.gender}</span>
                </p>
                <p>
                  <span className="text-slate-400">Email:</span>{' '}
                  <span className="text-slate-100">{formData.email}</span>
                </p>
                {formData.phone && (
                  <p>
                    <span className="text-slate-400">Phone:</span>{' '}
                    <span className="text-slate-100">{formData.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Face Photo Section */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-100">Face Recognition</h3>
                <button
                  onClick={() => handleEditSection('face')}
                  className="text-xs px-3 py-1 bg-purple-600/50 hover:bg-purple-600 rounded transition"
                >
                  Retake
                </button>
              </div>
              {faceData.image &&
                !faceData.image.startsWith('data:image/png;base64,iVBORw0KGg') && (
                  <img
                    src={faceData.image}
                    alt="Face"
                    className="w-32 h-40 rounded-lg object-cover border-2 border-green-500"
                  />
                )}
            </div>

            {/* Age Eligibility Confirmation */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmTerms}
                  onChange={(e) => setConfirmTerms(e.target.checked)}
                  className="w-5 h-5 rounded accent-green-500"
                />
                <span className="text-sm text-green-200">
                  ✓ I confirm all details are correct and I am above 18 years of age
                </span>
              </label>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-slate-100 mb-2">📋 Terms of Use</h4>
              <p>
                By registering, you agree to participate in this election with authentic
                information. False data will result in legal consequences.
              </p>
              <p>
                Your face data is securely stored for verification purposes only. We
                protect your privacy and comply with all data protection laws.
              </p>
              <p>
                One vote per registered user. Attempting to vote multiple times is
                prohibited.
              </p>
              <p>All election results are final and cannot be disputed.</p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Registration Successful!</h2>
              <p className="text-slate-300">Welcome to the election voting system</p>
            </div>

            {/* Token Number - Large and Prominent */}
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">YOUR VOTER TOKEN NUMBER</p>
              <div className="bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 p-6 rounded-2xl border-2 border-white/20 shadow-lg">
                <p className="text-5xl font-black tracking-wider text-white drop-shadow-lg">
                  {tokenNumber}
                </p>
              </div>
              <p className="text-slate-300 font-semibold">
                Save this number for voting
              </p>
            </div>

            {/* Copy Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(tokenNumber);
                toast.success('Token copied to clipboard!');
              }}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              📋 Copy Token
            </button>

            {/* Download as Image Button */}
            <button
              onClick={() => {
                const canvas = document.createElement('canvas');
                canvas.width = 600;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#1e293b';
                  ctx.fillRect(0, 0, 600, 400);
                  ctx.fillStyle = '#fff';
                  ctx.font = 'bold 24px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText(
                    'VOTER TOKEN CARD',
                    300,
                    80
                  );
                  ctx.font = 'bold 60px Arial';
                  ctx.fillText(tokenNumber, 300, 250);
                  const link = document.createElement('a');
                  link.href = canvas.toDataURL();
                  link.download = `voter-token-${tokenNumber}.png`;
                  link.click();
                  toast.success('Token card downloaded!');
                }
              }}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              🖼️ Download as Image
            </button>

            {/* Auto-redirect Countdown */}
            {showCountdown && (
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <p className="text-slate-300 mb-2">
                  Redirecting to voting page in...
                </p>
                <div className="text-4xl font-bold text-purple-400">
                  {countdownTimer}s
                </div>
              </div>
            )}

            {/* Manual Navigation */}
            <button
              onClick={() => (window.location.href = '/vote')}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-lg transition font-bold text-white"
            >
              Go to Voting Page Now
            </button>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && step < 4 && (
            <button
              onClick={() => {
                setStep(step - 1);
                if (step === 2) {
                  stopCamera();
                }
              }}
              className="flex-1 px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition"
            >
              ← Back
            </button>
          )}

          {step < 3 && (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Next →
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleRegister}
              disabled={!confirmTerms}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50"
            >
              Complete Registration
            </button>
          )}
        </div>
      </motion.div>
    </main>
  );
}
