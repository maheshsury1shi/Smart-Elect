export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Profile {
  _id: string;
  userId: string;
  fullName: string;
  aadhaarHash: string;
  dateOfBirth: string;
  gender: string;
  tokenNumber: string;
  hasVoted: boolean;
  createdAt: string;
}

export interface Candidate {
  _id: string;
  name: string;
  party: string;
  symbol?: string;
  manifesto?: string;
  photo?: string;
  voteCount: number;
  createdAt: string;
}

export interface Vote {
  _id: string;
  voterId: Profile | string;
  candidateId: Candidate | string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface VotingState {
  profile: Profile | null;
  candidates: Candidate[];
  votes: Vote[];
  resultsStatus: boolean;
}
