import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { resultsAPI, candidateAPI, voteAPI, profileAPI } from '../utils/api';
import { hashAadhaar, loadModels, detectFace } from '../utils/faceApi';
import { formatAadhaarInput } from '../utils/validation';
import {
  convertDistanceToConfidence,
  getVotingErrorMessage,
  SessionTimeoutManager,
  LockoutManager,
  downloadVoteReceipt,
  votingLogger,
  VoteReceipt,
} from '../utils/votingUtils';
import { Candidate } from '../types';

export default function Vote() {
  // Step and loading states
  const [step, setStep] = useState(1);
  const [resultsStatus, setResultsStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Data states
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [profileId, setProfileId] = useState('');

  // Step 1: Verification states
  const [verifyData, setVerifyData] = useState({
    tokenNumber: '',
    aadhaarNumber: '',
    fullName: '',
    dateOfBirth: '',
  });

  const [faceDescriptor, setFaceDescriptor] = useState<number[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Step 2: Candidate selection states
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [showCandidateProfile, setShowCandidateProfile] = useState<string | null>(null);

  // Step 3: Confirmation states
  const [confirmDeclaration, setConfirmDeclaration] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(0);
  const [showLogoutCountdown, setShowLogoutCountdown] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);

  // Managers
  const sessionTimeoutRef = useRef<SessionTimeoutManager | null>(null);
  const lockoutManagerRef = useRef(new LockoutManager(3, 10 * 60 * 1000));
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effects for initialization
  useEffect(() => {
    votingLogger.logStep('initialization', 'Vote component initialized');

    // Load models asynchronously
    loadModels()
      .then(() => {
        votingLogger.logStep('models', 'Face models loaded');
        console.log('Models loaded in Vote');
      })
      .catch((error) => {
        votingLogger.logStep('models', 'Failed to load face models', { error: String(error) });
        console.error('Failed to load face models:', error);
      });

    // Fetch voting data
    fetchVoteData();

    // Setup session timeout (5 minutes)
    sessionTimeoutRef.current = new SessionTimeoutManager(() => {
      handleSessionTimeout();
    }, 5 * 60 * 1000);

    return () => {
      sessionTimeoutRef.current?.clear();
    };
  }, []);

  // Effect for logout countdown
  useEffect(() => {
    if (step === 3 && voteReceipt && logoutCountdown > 0) {
      const timer = setTimeout(() => {
        setLogoutCountdown(logoutCountdown - 1);
      }, 1000);

      if (logoutCountdown === 1) {
        handleLogout();
      }

      return () => clearTimeout(timer);
    }
  }, [logoutCountdown, step, voteReceipt]);

  // Prevent browser back button during voting
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (step > 1 && step < 4) {
        e.preventDefault();
        toast.error('Cannot navigate back during voting. Use the Back button to return to previous step.');
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (step > 1 && step < 4) {
      window.addEventListener('popstate', handlePopState);
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [step]);

  const fetchVoteData = async () => {
    votingLogger.logStep('data-fetch', 'Fetching voting data');
    try {
      const statusRes = await resultsAPI.getStatus();
      setResultsStatus(statusRes.data.declared);
      votingLogger.logStep('data-fetch', 'Results status fetched', { declared: statusRes.data.declared });

      const candRes = await candidateAPI.getAllCandidates();
      setCandidates(candRes.data);
      votingLogger.logStep('data-fetch', 'Candidates fetched', { count: candRes.data.length });
    } catch (error) {
      votingLogger.logStep('data-fetch', 'Failed to fetch voting data', { error: String(error) });
      console.error('Failed to fetch vote data:', error);
      toast.error('Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  // Session timeout handler
  const handleSessionTimeout = () => {
    votingLogger.logStep('session', 'Session timeout triggered');
    setVerificationError('session_timeout');
    setVerifyData({
      tokenNumber: '',
      aadhaarNumber: '',
      fullName: '',
      dateOfBirth: '',
    });
    setFaceDescriptor([]);
    setConfidenceScore(null);
    toast.error('Session expired. Please start verification again.');
  };

  // Activity tracker for session timeout
  const trackActivity = () => {
    sessionTimeoutRef.current?.reset();
  };

  // Camera management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      votingLogger.logStep('camera', 'Camera access failed', { error: String(error) });
      console.error('Camera error:', error);
      toast.info('Camera not available. You can proceed with demo mode.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureFaceForVerification = async () => {
    try {
      votingLogger.logStep('face-capture', 'Face capture initiated');

      if (!videoRef.current) {
        toast.error('Camera not available');
        votingLogger.logStep('face-capture', 'Camera not available');
        return;
      }

      // Wait for video to be fully ready
      let retries = 0;
      while ((videoRef.current.readyState || 0) < 2 && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if ((videoRef.current.readyState || 0) < 2) {
        toast.error('Camera not ready. Please try again.');
        votingLogger.logStep('face-capture', 'Camera not ready');
        return;
      }

      // Use real face detection from face-api.js
      // Moderate threshold (0.35) for reliable face detection
      const detections = await detectFace(videoRef.current, 0.35);

      if (!detections) {
        toast.error('No face detected. Please position your face clearly in the camera.');
        votingLogger.logStep('face-capture', 'No face detected');
        return;
      }

      const descriptor = Array.from(detections.descriptor);
      const confidence = Math.min(100, (detections.detection.score * 100));

      setFaceDescriptor(descriptor);
      setConfidenceScore(confidence);

      votingLogger.logStep('face-capture', 'Face captured', { confidence: confidence });
      toast.success('Face captured successfully');
      trackActivity();
    } catch (error) {
      votingLogger.logStep('face-capture', 'Face capture failed', { error: String(error) });
      console.error('Photo capture error:', error);
      toast.error('Face capture failed. Please try again.');
    }
  };

  // Handle face capture when clicking photo button
  useEffect(() => {
    if (step === 1) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  // Verification handler
  const handleVerify = async () => {
    trackActivity();

    // Check lockout status
    if (lockoutManagerRef.current?.isLockedOut()) {
      const remainingSeconds = lockoutManagerRef.current.getRemainingLockoutSeconds();
      const minutes = Math.ceil(remainingSeconds / 60);
      setVerificationError('lockout');
      toast.error(`Too many failed attempts. Try again in ${minutes} minute(s).`);
      votingLogger.logStep('verification', 'Lockout active', { remainingSeconds });
      return;
    }

    try {
      if (!verifyData.tokenNumber || !verifyData.aadhaarNumber || !verifyData.fullName) {
        toast.error('Please fill all required fields');
        return;
      }

      if (faceDescriptor.length === 0) {
        toast.error('Please capture a face photo first');
        return;
      }

      votingLogger.logStep('verification', 'Verification attempt started', {
        token: verifyData.tokenNumber,
      });

      // Clean Aadhaar (remove non-digits) to match registration process
      const cleanedAadhaar = verifyData.aadhaarNumber.replace(/\D/g, '');
      console.log('Frontend Aadhaar Debug:', {
        raw: verifyData.aadhaarNumber,
        cleaned: cleanedAadhaar,
        cleanedLength: cleanedAadhaar.length,
      });
      
      const aadhaarHash = await hashAadhaar(cleanedAadhaar);
      console.log('Frontend Hash Debug:', { aadhaarHash, hashLength: aadhaarHash.length });

      const response = await profileAPI.verifyVoterByFace({
        tokenNumber: verifyData.tokenNumber,
        aadhaarHash,
        fullName: verifyData.fullName,
        dateOfBirth: verifyData.dateOfBirth,
        faceDescriptor: faceDescriptor,
      });

      setProfileId(response.data.profileId);
      setVerificationError(null);
      lockoutManagerRef.current?.reset();

      votingLogger.logStep('verification', 'Verification successful', {
        profileId: response.data.profileId,
      });

      toast.success('✓ Verification successful');
      setStep(2);

      // Load candidates for step 2
      setLoadingCandidates(true);
      try {
        const candRes = await candidateAPI.getAllCandidates();
        setCandidates(candRes.data);
      } catch (error) {
        toast.error('Failed to load candidates');
      } finally {
        setLoadingCandidates(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Verification failed';
      const errorType = error.response?.data?.errorType || 'default';

      // Record failure for lockout
      lockoutManagerRef.current?.recordFailure();

      const errorInfo = getVotingErrorMessage(errorType);
      setVerificationError(errorType);

      votingLogger.logStep('verification', 'Verification failed', {
        errorType,
        message: errorMsg,
        remainingAttempts: lockoutManagerRef.current?.getRemainingAttempts(),
      });

      toast.error(errorInfo.message);
      toast.error(errorInfo.action);
    }
  };

  // Handle candidate selection
  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    votingLogger.logStep('selection', 'Candidate selected', {
      candidateId: candidate._id,
      name: candidate.name,
    });
    trackActivity();
  };

  // Handle vote casting
  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    if (!confirmDeclaration) {
      toast.error('Please confirm the declaration');
      return;
    }

    try {
      votingLogger.logStep('casting', 'Vote casting initiated', {
        candidateId: selectedCandidate._id,
      });

      const castVoteResponse = await voteAPI.castVote({
        profileId,
        candidateId: selectedCandidate._id,
      });

      votingLogger.logStep('casting', 'Vote cast successfully', {
        voteId: castVoteResponse.data._id,
      });

      // Generate receipt
      const receipt: VoteReceipt = {
        tokenNumber: verifyData.tokenNumber,
        candidateName: selectedCandidate.name,
        partyName: selectedCandidate.party,
        timestamp: new Date().toLocaleString(),
        voteId: castVoteResponse.data._id,
        confidence: confidenceScore || 0,
      };

      setVoteReceipt(receipt);
      setStep(4); // Move to success/receipt step

      // Start logout countdown (15 seconds)
      setLogoutCountdown(15);
      setShowLogoutCountdown(true);

      toast.success('🎉 Vote cast successfully!');
    } catch (error: any) {
      votingLogger.logStep('casting', 'Vote casting failed', { error: String(error) });
      toast.error(error.response?.data?.message || 'Failed to cast vote');
    }
  };

  // Handle logout
  const handleLogout = () => {
    votingLogger.logStep('logout', 'Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Handle stay (cancel logout countdown)
  const handleStayLoggedIn = () => {
    setLogoutCountdown(0);
    setShowLogoutCountdown(false);
    toast.info('Logout cancelled. You can download your receipt.');
    votingLogger.logStep('logout', 'Logout cancelled by user');
  };

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter((candidate) => {
    const query = candidateSearchQuery.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(query) || candidate.party.toLowerCase().includes(query)
    );
  });

  // Aadhaar display
  const displayAadhaar = verifyData.aadhaarNumber;

  // Verification error handling
  const verificationErrorInfo = verificationError
    ? getVotingErrorMessage(verificationError)
    : null;

  // Loading skeleton for candidates
  const CandidateLoadingSkeleton = () => (
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass p-6 rounded-2xl animate-pulse">
          <div className="h-12 bg-slate-700 rounded mb-4" />
          <div className="h-6 bg-slate-700 rounded mb-2" />
          <div className="h-4 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );

  if (resultsStatus) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass p-12 rounded-2xl border border-purple-500/30"
        >
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-bold mb-4">Voting Closed</h1>
          <p className="text-xl text-slate-300">
            Voting has ended. Please check the results.
          </p>
          <button
            onClick={() => (window.location.href = '/results')}
            className="mt-6 px-8 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            View Results
          </button>
        </motion.div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8" onClick={trackActivity}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-8 text-center gradient-text">🗳️ Cast Your Vote</h1>

        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {['Verification', 'Candidate', 'Confirm'].map((label, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition ${
                      step > idx + 1
                        ? 'bg-green-500 text-white'
                        : step === idx + 1
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs text-slate-400 text-center">{label}</span>
                </div>
              ))}
            </div>
            {/* Progress Line */}
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Verification */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass p-8 rounded-2xl border border-purple-500/30"
          >
            <h2 className="text-2xl font-bold mb-6">Step 1: Voter Verification</h2>

            {/* Verification Error Display */}
            {verificationErrorInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{verificationErrorInfo.icon}</span>
                  <div>
                    <p className="font-bold text-red-300 mb-1">{verificationErrorInfo.message}</p>
                    <p className="text-sm text-red-200">{verificationErrorInfo.action}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Token Number */}
              <div>
                <label className="block mb-2 font-semibold">Token Number</label>
                <input
                  type="text"
                  value={verifyData.tokenNumber}
                  onChange={(e) => {
                    setVerifyData({ ...verifyData, tokenNumber: e.target.value });
                    trackActivity();
                  }}
                  placeholder="Enter 6-digit token number"
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  disabled={lockoutManagerRef.current?.isLockedOut()}
                />
              </div>

              {/* Aadhaar Number with Masking */}
              <div>
                <label className="block mb-2 font-semibold">Aadhaar Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={verifyData.aadhaarNumber}
                    onChange={(e) => {
                      setVerifyData({ ...verifyData, aadhaarNumber: formatAadhaarInput(e.target.value) });
                      trackActivity();
                    }}
                    placeholder="Enter 12-digit Aadhaar"
                    maxLength={14}
                    className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                    disabled={lockoutManagerRef.current?.isLockedOut()}
                  />
                  <p className="text-xs text-slate-400 mt-1">📋 Display: {displayAadhaar || 'XXXX-XXXX-XXXX'}</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block mb-2 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={verifyData.fullName}
                  onChange={(e) => {
                    setVerifyData({ ...verifyData, fullName: e.target.value });
                    trackActivity();
                  }}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  disabled={lockoutManagerRef.current?.isLockedOut()}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block mb-2 font-semibold">Date of Birth</label>
                <input
                  type="date"
                  value={verifyData.dateOfBirth}
                  onChange={(e) => {
                    setVerifyData({ ...verifyData, dateOfBirth: e.target.value });
                    trackActivity();
                  }}
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
                  disabled={lockoutManagerRef.current?.isLockedOut()}
                />
              </div>

              {/* Face Verification */}
              <div>
                <label className="block mb-2 font-semibold">Face Verification</label>
                <div className="bg-slate-800 rounded-lg p-4">
                  {/* Camera Feed with Face Alignment Oval */}
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full rounded-lg"
                      width={640}
                      height={480}
                    />

                    {/* Face Alignment Guide Overlay - Oval */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-purple-500/50 rounded-full w-48 h-56" />
                      <p className="absolute bottom-8 text-purple-300 text-sm font-medium">
                        Center your face in the oval
                      </p>
                    </div>

                    <canvas ref={canvasRef} width={640} height={480} className="hidden" />
                  </div>

                  {/* Take Photo Button */}
                  <button
                    onClick={captureFaceForVerification}
                    disabled={lockoutManagerRef.current?.isLockedOut()}
                    className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    📷 Take Photo
                  </button>

                  {/* Face Captured Confirmation */}
                  {faceDescriptor.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg"
                    >
                      <p className="text-green-300 text-sm font-semibold">✓ Face captured</p>
                      {confidenceScore !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-green-300">Match Confidence</span>
                            <span className="text-sm font-bold text-green-400">{confidenceScore}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${confidenceScore}%` }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Lockout Timer Display */}
              {lockoutManagerRef.current?.isLockedOut() && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
                >
                  <p className="text-red-300 font-bold text-center">
                    🔒 Locked out for {lockoutManagerRef.current.getRemainingLockoutSeconds()}s
                  </p>
                  <p className="text-red-200 text-sm text-center mt-1">
                    Too many failed attempts. Please try again later.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={
                !verifyData.tokenNumber ||
                !verifyData.aadhaarNumber ||
                !verifyData.fullName ||
                faceDescriptor.length === 0 ||
                lockoutManagerRef.current?.isLockedOut() === true
              }
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify & Continue
            </button>
          </motion.div>
        )}

        {/* Step 2: Candidate Selection */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6">Step 2: Select Your Candidate</h2>

            {/* Search/Filter Box */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Search by candidate name or party"
                value={candidateSearchQuery}
                onChange={(e) => {
                  setCandidateSearchQuery(e.target.value);
                  trackActivity();
                }}
                className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Candidates Grid */}
            {loadingCandidates ? (
              <CandidateLoadingSkeleton />
            ) : (
              <div className="space-y-4">
                {/* Candidate Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCandidates.map((candidate, index) => (
                    <motion.div
                      key={candidate._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectCandidate(candidate)}
                      className={`p-6 rounded-2xl cursor-pointer transition border-2 ${
                        selectedCandidate?._id === candidate._id
                          ? 'glass border-purple-500 bg-purple-500/20'
                          : 'glass border-purple-500/30 hover:border-purple-500'
                      }`}
                    >
                      <div className="text-5xl mb-3 text-center">{candidate.symbol || '🎭'}</div>
                      <h3 className="text-lg font-bold text-center mb-2">{candidate.name}</h3>
                      <p className="text-center text-slate-400 text-sm mb-3">{candidate.party}</p>

                      {/* View Profile Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCandidateProfile(
                            showCandidateProfile === candidate._id ? null : candidate._id
                          );
                        }}
                        className="w-full px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-xs transition"
                      >
                        {showCandidateProfile === candidate._id ? '▲ Hide Profile' : '▼ View Profile'}
                      </button>

                      {/* Expanded Profile */}
                      <AnimatePresence>
                        {showCandidateProfile === candidate._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-purple-500/30"
                          >
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {candidate.manifesto || 'No manifesto available'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* NOTA Option */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filteredCandidates.length * 0.05 }}
                  onClick={() => handleSelectCandidate({ _id: 'NOTA', name: 'NOTA', party: 'None of the Above', symbol: '✋', voteCount: 0, createdAt: new Date().toISOString() })}
                  className={`p-6 rounded-2xl cursor-pointer transition border-2 ${
                    selectedCandidate?.name === 'NOTA'
                      ? 'glass border-purple-500 bg-purple-500/20'
                      : 'glass border-purple-500/30 hover:border-purple-500'
                  }`}
                >
                  <div className="text-5xl mb-3 text-center">✋</div>
                  <h3 className="text-lg font-bold text-center mb-2">NOTA</h3>
                  <p className="text-center text-slate-400 text-sm">None of the Above</p>
                </motion.div>

                {/* No Results Message */}
                {filteredCandidates.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p>No candidates match your search.</p>
                  </div>
                )}
              </div>
            )}

            {/* Next Button */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedCandidate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Vote →
              </button>
            </div>

            {!selectedCandidate && (
              <p className="text-center text-slate-400 text-sm mt-3">
                💡 Please select a candidate to continue
              </p>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass p-12 rounded-2xl border border-purple-500/30"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Step 3: Confirm Your Vote</h2>

            {/* Candidate Review */}
            <div className="bg-slate-800 p-8 rounded-lg mb-8">
              <p className="text-slate-400 mb-2 text-center">You are voting for:</p>
              <div className="text-5xl mb-4 text-center">{selectedCandidate?.symbol || '🎭'}</div>
              <p className="text-3xl font-bold gradient-text text-center mb-2">{selectedCandidate?.name}</p>
              <p className="text-lg text-slate-300 text-center mb-4">{selectedCandidate?.party}</p>
              {selectedCandidate?.manifesto && (
                <div className="bg-slate-700/50 p-4 rounded-lg mt-4">
                  <p className="text-xs text-slate-400 mb-2">Manifesto:</p>
                  <p className="text-sm text-slate-300">{selectedCandidate.manifesto}</p>
                </div>
              )}
            </div>

            {/* Declaration Checkbox */}
            <div
              onClick={() => setConfirmDeclaration(!confirmDeclaration)}
              className="mb-8 p-4 bg-slate-800 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmDeclaration}
                  onChange={() => setConfirmDeclaration(!confirmDeclaration)}
                  className="w-5 h-5"
                  onClick={trackActivity}
                />
                <span className="text-slate-300">
                  I confirm this is my free and voluntary vote.
                </span>
              </label>
            </div>

            <p className="text-slate-400 mb-8 text-center text-sm">
              ⚠️ This action cannot be undone. Please review your selection carefully.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep(2);
                }}
                className="flex-1 px-4 py-3 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={handleCastVote}
                disabled={!confirmDeclaration}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗳️ Cast Vote
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Vote Receipt */}
        {step === 4 && voteReceipt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center glass p-12 rounded-2xl border border-green-500/30"
          >
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold mb-2 text-green-400">Vote Cast Successfully!</h2>
            <p className="text-slate-300 mb-8">Your vote has been securely recorded.</p>

            {/* Vote Receipt */}
            <div className="bg-slate-800 p-8 rounded-lg mb-8 border border-green-500/30 text-left">
              <p className="text-center font-bold text-lg mb-6 text-green-400">Vote Receipt</p>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Candidate</span>
                  <span className="font-bold text-slate-200">{voteReceipt.candidateName}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Party</span>
                  <span className="font-bold text-slate-200">{voteReceipt.partyName}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Token (Masked)</span>
                  <span className="font-mono text-slate-200">{voteReceipt.tokenNumber}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-slate-200">{voteReceipt.timestamp}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Reference ID</span>
                  <span className="font-mono text-xs text-slate-300 break-all">{voteReceipt.voteId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Match Confidence</span>
                  <span className="font-bold text-green-400">{voteReceipt.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Download Receipt Button */}
            <button
              onClick={() => downloadVoteReceipt(voteReceipt)}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-bold mb-4"
            >
              ⬇️ Download Receipt
            </button>

            {/* Logout Countdown */}
            {showLogoutCountdown && logoutCountdown > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-4"
              >
                <p className="text-orange-300 font-bold mb-3">
                  ⏱️ Logging you out in {logoutCountdown}s
                </p>
                <button
                  onClick={handleStayLoggedIn}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition font-semibold text-white text-sm"
                >
                  Stay Logged In
                </button>
              </motion.div>
            )}

            {!showLogoutCountdown && (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition font-bold"
              >
                ✓ Logout
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
