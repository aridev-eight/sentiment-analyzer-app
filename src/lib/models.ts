import { ObjectId } from 'mongodb';

export interface AnalysisHistory {
  _id?: ObjectId;
  userId: string;
  text: string;
  textPreview: string;
  label: string;
  score: number;
  primaryEmotion?: string;
  emotions?: Array<{
    emotion: string;
    score: number;
  }>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  _id?: ObjectId;
  userId: string;
  email: string;
  name: string;
  image?: string;
  totalAnalyses: number;
  createdAt: Date;
  updatedAt: Date;
}
