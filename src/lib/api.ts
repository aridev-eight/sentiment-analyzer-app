import { SentimentAnalysisRequest, SentimentAnalysisResponse, ApiError } from '@/types';

export async function analyzeSentiment(text: string): Promise<SentimentAnalysisResponse> {
  const response = await fetch('/api/analyze-sentiment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text } as SentimentAnalysisRequest),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'Failed to analyze sentiment');
  }

  return response.json();
}
