/**
 * Voting flow utilities for verification, face matching, lockout, and receipts
 */

import { Candidate } from '../types';

/**
 * Convert Euclidean distance to confidence percentage
 * Lower distance = higher confidence (0 = perfect match)
 * @param distance - Euclidean distance from face comparison
 * @returns Confidence percentage (0-100)
 */
export const convertDistanceToConfidence = (distance: number): number => {
  // Typical face-api distances: 0.3-0.6 for match, 0.6+ for no match
  // Map to percentage where distance < 0.3 = 100%, distance > 0.8 = 0%
  if (distance < 0) return 0;
  if (distance > 1) return 0;
  
  // Inverse mapping: lower distance = higher confidence
  const confidence = Math.max(0, (1 - distance) * 100);
  return Math.round(confidence);
};

/**
 * Get specific error message for voting verification failures
 * @param errorType - Type of error (face_not_matched, token_not_found, aadhaar_mismatch, already_voted, face_not_detected, etc.)
 * @returns Object with message and suggested action
 */
export const getVotingErrorMessage = (
  errorType: string
): { message: string; action: string; icon: string } => {
  const errorMap: Record<string, { message: string; action: string; icon: string }> = {
    face_not_matched: {
      message: 'Face not matched',
      action: 'Please ensure your face matches the registered photo. Remove glasses and ensure good lighting.',
      icon: '👤',
    },
    token_not_found: {
      message: 'Token not found',
      action: 'The token number you entered is not registered. Please verify and try again.',
      icon: '🔑',
    },
    aadhaar_mismatch: {
      message: 'Aadhaar mismatch',
      action: 'The Aadhaar number does not match our records. Please check and re-enter.',
      icon: '📋',
    },
    already_voted: {
      message: 'Already voted',
      action: 'You have already cast your vote in this election. Each voter can only vote once.',
      icon: '✓',
    },
    face_not_detected: {
      message: 'Face not detected',
      action: 'Could not detect a face in the camera. Please position yourself clearly in the frame.',
      icon: '📷',
    },
    name_mismatch: {
      message: 'Name mismatch',
      action: 'The name does not match our records. Please verify the spelling and try again.',
      icon: '📝',
    },
    dob_mismatch: {
      message: 'Date of birth mismatch',
      action: 'The date of birth you entered does not match our records. Please verify and try again.',
      icon: '📅',
    },
    invalid_input: {
      message: 'Missing information',
      action: 'Please fill all required fields: Token Number, Aadhaar, Full Name, and Date of Birth.',
      icon: '⚠️',
    },
    invalid_face: {
      message: 'Invalid face capture',
      action: 'Face capture failed or is invalid. Please capture your face again.',
      icon: '📷',
    },
    session_timeout: {
      message: 'Session expired',
      action: 'Your verification session has expired due to inactivity. Please start the process again.',
      icon: '⏱️',
    },
    lockout: {
      message: 'Too many failed attempts',
      action: 'You have reached the maximum failed attempts. Please try again after 10 minutes.',
      icon: '🔒',
    },
    default: {
      message: 'Verification failed',
      action: 'Please try again. If the problem persists, contact the polling officer.',
      icon: '⚠️',
    },
  };

  return errorMap[errorType] || errorMap['default'];
};

/**
 * Session timeout manager for voting verification step
 * Automatically clears form after 5 minutes of inactivity
 */
export class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private inactivityDuration: number = 5 * 60 * 1000; // 5 minutes
  private onTimeout: (() => void) | null = null;

  constructor(onTimeout: () => void, durationMs?: number) {
    this.onTimeout = onTimeout;
    if (durationMs) this.inactivityDuration = durationMs;
  }

  /**
   * Start the timeout timer
   */
  public start(): void {
    this.reset();
  }

  /**
   * Reset the timeout timer (call on user activity)
   */
  public reset(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      if (this.onTimeout) {
        this.onTimeout();
      }
    }, this.inactivityDuration);
  }

  /**
   * Clear the timeout
   */
  public clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get remaining time in seconds
   */
  public getRemainingSeconds(): number {
    return Math.round(this.inactivityDuration / 1000);
  }
}

/**
 * Lockout manager for failed face verification attempts
 * Locks out after N failed attempts for M minutes
 */
export class LockoutManager {
  private failedAttempts: number = 0;
  private maxAttempts: number = 3;
  private lockoutDuration: number = 10 * 60 * 1000; // 10 minutes
  private lockedUntil: number | null = null;

  constructor(maxAttempts: number = 3, lockoutDurationMs: number = 10 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.lockoutDuration = lockoutDurationMs;
  }

  /**
   * Check if currently locked out
   */
  public isLockedOut(): boolean {
    if (!this.lockedUntil) return false;
    
    if (Date.now() >= this.lockedUntil) {
      this.lockedUntil = null;
      this.failedAttempts = 0;
      return false;
    }
    
    return true;
  }

  /**
   * Record a failed attempt
   */
  public recordFailure(): boolean {
    if (this.isLockedOut()) return false;

    this.failedAttempts++;

    if (this.failedAttempts >= this.maxAttempts) {
      this.lockedUntil = Date.now() + this.lockoutDuration;
      return false; // Locked out
    }

    return true; // Can try again
  }

  /**
   * Reset the failure counter
   */
  public reset(): void {
    this.failedAttempts = 0;
    this.lockedUntil = null;
  }

  /**
   * Get remaining lockout time in seconds
   */
  public getRemainingLockoutSeconds(): number {
    if (!this.lockedUntil || Date.now() >= this.lockedUntil) return 0;
    return Math.round((this.lockedUntil - Date.now()) / 1000);
  }

  /**
   * Get number of remaining attempts
   */
  public getRemainingAttempts(): number {
    if (this.isLockedOut()) return 0;
    return Math.max(0, this.maxAttempts - this.failedAttempts);
  }

  /**
   * Get failed attempts count
   */
  public getFailedAttempts(): number {
    return this.failedAttempts;
  }
}

/**
 * Vote receipt data structure and formatter
 */
export interface VoteReceipt {
  tokenNumber: string;
  candidateName: string;
  partyName: string;
  timestamp: string;
  voteId: string;
  confidence: number;
}

/**
 * Format vote receipt for display
 */
export const formatVoteReceipt = (receipt: VoteReceipt): string => {
  return `
┌────────────────────────────────────────┐
│      🗳️  VOTE RECEIPT (Reference)      │
├────────────────────────────────────────┤
│ Token: ${receipt.tokenNumber}
│ Candidate: ${receipt.candidateName}
│ Party: ${receipt.partyName}
│ Time: ${receipt.timestamp}
│ Vote ID: ${receipt.voteId}
│ Confidence: ${receipt.confidence}%
└────────────────────────────────────────┘
  `.trim();
};

/**
 * Create downloadable receipt as text file
 */
export const downloadVoteReceipt = (receipt: VoteReceipt): void => {
  const content = formatVoteReceipt(receipt);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `vote_receipt_${receipt.voteId}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Voting flow logger for tracking user journey
 */
export class VotingLogger {
  private logs: Array<{
    timestamp: string;
    step: string;
    message: string;
    data?: Record<string, any>;
  }> = [];

  /**
   * Log a voting step
   */
  public logStep(step: string, message: string, data?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const log = { timestamp, step, message, data };
    this.logs.push(log);
    console.log(`[${step}] ${message}`, data);
  }

  /**
   * Get all logs
   */
  public getLogs() {
    return this.logs;
  }

  /**
   * Export logs to JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear logs
   */
  public clear(): void {
    this.logs = [];
  }
}

/**
 * Create a singleton instance of VotingLogger
 */
export const votingLogger = new VotingLogger();
