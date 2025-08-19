export interface SentimentAnalysisRequest {
  text: string;
}

export interface EmotionData {
  emotion: string;
  score: number;
}

export interface SentimentAnalysisResponse {
  label: string;
  score: number;
  text: string;
  timestamp: string;
  emotions?: EmotionData[];
  primaryEmotion?: string;
}

export interface HuggingFaceResponse {
  label: string;
  score: number;
}

export interface ApiError {
  error: string;
  message: string;
}

// New types for history and analytics
export interface AnalysisHistoryItem extends SentimentAnalysisResponse {
  id: string;
  textPreview: string;
}

export interface AnalyticsData {
  totalAnalyses: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  emotionDistribution: {
    joy: number;
    love: number;
    surprise: number;
    anger: number;
    sadness: number;
    fear: number;
    disgust: number;
    neutral: number;
  };
  averageConfidence: number;
  recentAnalyses: AnalysisHistoryItem[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}
