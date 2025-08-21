import clientPromise from './mongodb';
import { AnalysisHistory, UserProfile } from './models';
import { SentimentAnalysisResponse } from '@/types';
import { ObjectId } from 'mongodb';

export class DatabaseService {
  static async getDb() {
    const client = await clientPromise;
    return client.db(process.env.MONGODB_DB || 'sentiscope');
  }

  static async saveAnalysis(userId: string, result: SentimentAnalysisResponse): Promise<void> {
    try {
      const db = await this.getDb();
      const collection = db.collection('analyses');

      const analysis: Omit<AnalysisHistory, '_id'> = {
        userId,
        text: result.text,
        textPreview: result.text.length > 50 
          ? result.text.substring(0, 50) + '...' 
          : result.text,
        label: result.label,
        score: result.score,
        primaryEmotion: result.primaryEmotion,
        emotions: result.emotions,
        timestamp: new Date(result.timestamp),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(analysis);

      // Update user profile
      await this.updateUserProfile(userId);
    } catch (error) {
      console.error('Error saving analysis to database:', error);
      throw error;
    }
  }

  static async getUserAnalyses(userId: string, limit: number = 50): Promise<AnalysisHistory[]> {
    try {
      const db = await this.getDb();
      const collection = db.collection('analyses');

      const analyses = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return analyses as AnalysisHistory[];
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      return [];
    }
  }

  static async searchUserAnalyses(
    userId: string, 
    searchTerm: string, 
    filterSentiment: string = 'all',
    limit: number = 50
  ): Promise<AnalysisHistory[]> {
    try {
      const db = await this.getDb();
      const collection = db.collection('analyses');

      const query: Record<string, unknown> = { userId };

      // Add search filter
      if (searchTerm) {
        query.$or = [
          { text: { $regex: searchTerm, $options: 'i' } },
          { label: { $regex: searchTerm, $options: 'i' } },
          { primaryEmotion: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      // Add sentiment filter
      if (filterSentiment !== 'all') {
        query.label = filterSentiment;
      }

      const analyses = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return analyses as AnalysisHistory[];
    } catch (error) {
      console.error('Error searching user analyses:', error);
      return [];
    }
  }

  static async deleteAnalysis(userId: string, analysisId: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const collection = db.collection('analyses');

      const result = await collection.deleteOne({
        _id: new ObjectId(analysisId),
        userId,
      });

      if (result.deletedCount > 0) {
        await this.updateUserProfile(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }
  }

  static async clearUserHistory(userId: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const collection = db.collection('analyses');

      const result = await collection.deleteMany({ userId });

      if (result.deletedCount > 0) {
        await this.updateUserProfile(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error clearing user history:', error);
      return false;
    }
  }

  private static async updateUserProfile(userId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const analysesCollection = db.collection('analyses');
      const profilesCollection = db.collection('profiles');

      const totalAnalyses = await analysesCollection.countDocuments({ userId });

      await profilesCollection.updateOne(
        { userId },
        { 
          $set: { 
            totalAnalyses,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const db = await this.getDb();
      const collection = db.collection('profiles');

      const profile = await collection.findOne({ userId });
      return profile as UserProfile | null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
}
