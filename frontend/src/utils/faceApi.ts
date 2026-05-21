// @ts-ignore
import * as faceapi from 'face-api.js';

export const loadModels = async () => {
  try {
    const modelPath = `${window.location.origin}/models`;
    console.log(`Loading models from: ${modelPath}`);
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
    ]);
    console.log('Face-api models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    console.error('Failed to load face-api models. Make sure model files exist in frontend/public/models/');
    throw error;
  }
};

export const detectFace = async (video: HTMLVideoElement) => {
  try {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.5
      }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
};

export const hashAadhaar = async (aadhaar: string): Promise<string> => {
  // SHA-256 hash using Web Crypto API - matches Node.js crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(aadhaar);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const captureFaceImage = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
  return null;
};

export const compareFaces = (descriptor1: Float32Array, descriptor2: Float32Array): number => {
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
