import { SentimentAnalysisResponse, AnalysisHistoryItem, AnalyticsData } from '@/types';

const HISTORY_KEY = 'sentiment-analysis-history';
const MAX_HISTORY_ITEMS = 50;

export class HistoryService {
  static saveAnalysis(result: SentimentAnalysisResponse): void {
    try {
      const history = this.getHistory();
      
      const newItem: AnalysisHistoryItem = {
        ...result,
        id: this.generateId(),
        textPreview: result.text.length > 50 
          ? result.text.substring(0, 50) + '...' 
          : result.text
      };

      // Add to beginning of array (most recent first)
      history.unshift(newItem);

      // Keep only the most recent items
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving analysis to history:', error);
    }
  }

  static getHistory(): AnalysisHistoryItem[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  static getAllHistory(): AnalysisHistoryItem[] {
    return this.getHistory();
  }

  static getRecentHistory(limit: number = 10): AnalysisHistoryItem[] {
    return this.getHistory().slice(0, limit);
  }

  static clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  static getAnalytics(): AnalyticsData {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return {
        totalAnalyses: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        emotionDistribution: {
          joy: 0, love: 0, surprise: 0, anger: 0, sadness: 0, fear: 0, disgust: 0, neutral: 0
        },
        averageConfidence: 0,
        recentAnalyses: []
      };
    }

    const sentimentCounts = history.reduce((acc, item) => {
      acc[item.label] = (acc[item.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emotionCounts = history.reduce((acc, item) => {
      if (item.primaryEmotion) {
        acc[item.primaryEmotion] = (acc[item.primaryEmotion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalConfidence = history.reduce((sum, item) => sum + item.score, 0);
    const averageConfidence = totalConfidence / history.length;

    return {
      totalAnalyses: history.length,
      sentimentDistribution: {
        positive: sentimentCounts.positive || 0,
        negative: sentimentCounts.negative || 0,
        neutral: sentimentCounts.neutral || 0
      },
      emotionDistribution: {
        joy: emotionCounts.joy || 0,
        love: emotionCounts.love || 0,
        surprise: emotionCounts.surprise || 0,
        anger: emotionCounts.anger || 0,
        sadness: emotionCounts.sadness || 0,
        fear: emotionCounts.fear || 0,
        disgust: emotionCounts.disgust || 0,
        neutral: emotionCounts.neutral || 0
      },
      averageConfidence,
      recentAnalyses: history // Return all history items for the enhanced dashboard
    };
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
