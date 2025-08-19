import { NextRequest, NextResponse } from 'next/server';
import { SentimentAnalysisRequest, SentimentAnalysisResponse, HuggingFaceResponse, ApiError } from '@/types';

// Using a comprehensive emotion detection model
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';

export async function POST(request: NextRequest) {
  try {
    const body: SentimentAnalysisRequest = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'VALIDATION_ERROR', message: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json<ApiError>(
        { error: 'VALIDATION_ERROR', message: 'Text must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGING_FACE_API_KEY;
    if (!apiKey) {
      console.error('HUGGING_FACE_API_KEY not found in environment variables');
      return NextResponse.json<ApiError>(
        { error: 'CONFIGURATION_ERROR', message: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Making request to Hugging Face API...');
    console.log('API URL:', HUGGING_FACE_API_URL);
    console.log('Text length:', text.length);
    console.log('API Key length:', apiKey.length);

    const response = await fetch(HUGGING_FACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error response:', errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No emotion analysis result received');
    }

    // Handle nested array structure: data[0] contains the emotion results
    const emotionResults = Array.isArray(data[0]) ? data[0] : data;
    
    if (!emotionResults || emotionResults.length === 0) {
      throw new Error('No emotion analysis result received');
    }

    // Get the highest scoring emotion
    const result = emotionResults.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    // Map emotions to sentiment categories and get additional emotions
    const emotionMapping = {
      'joy': 'positive',
      'love': 'positive', 
      'surprise': 'positive',
      'anger': 'negative',
      'sadness': 'negative',
      'fear': 'negative',
      'disgust': 'negative',
      'neutral': 'neutral'
    };

    const primaryEmotion = result.label.toLowerCase();
    const sentimentLabel = emotionMapping[primaryEmotion as keyof typeof emotionMapping] || 'neutral';

    // Get top 3 emotions for detailed analysis
    const topEmotions = emotionResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => ({
        emotion: item.label.toLowerCase(),
        score: item.score
      }));

    const sentimentResponse: SentimentAnalysisResponse = {
      label: sentimentLabel,
      score: result.score,
      text: text,
      timestamp: new Date().toISOString(),
      // Add emotion details to the response
      emotions: topEmotions,
      primaryEmotion: primaryEmotion
    };

    return NextResponse.json(sentimentResponse);

  } catch (error) {
    console.error('Emotion analysis error:', error);
    return NextResponse.json<ApiError>(
      { 
        error: 'INTERNAL_ERROR', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
