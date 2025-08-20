import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { SentimentAnalysisRequest, SentimentAnalysisResponse, HuggingFaceResponse, ApiError } from '@/types';

// Primary and fallback models
const PRIMARY_MODEL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';
const FALLBACK_MODEL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeHuggingFaceRequest(apiKey: string, text: string, modelUrl: string, retryCount = 0): Promise<Response> {
  try {
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    // If we get a 504 or 503, retry
    if ((response.status === 504 || response.status === 503) && retryCount < MAX_RETRIES) {
      console.log(`Hugging Face API timeout (${response.status}), retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return makeHuggingFaceRequest(apiKey, text, modelUrl, retryCount + 1);
    }

    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Hugging Face API error, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return makeHuggingFaceRequest(apiKey, text, modelUrl, retryCount + 1);
    }
    throw error;
  }
}

async function tryAnalysisWithFallback(apiKey: string, text: string): Promise<{ data: any; modelUsed: string }> {
  try {
    // Try primary model first
    console.log('Trying primary emotion model...');
    const response = await makeHuggingFaceRequest(apiKey, text, PRIMARY_MODEL);
    
    if (response.ok) {
      const data = await response.json();
      return { data, modelUsed: 'primary' };
    }
    
    // If primary fails, try fallback model
    console.log('Primary model failed, trying fallback sentiment model...');
    const fallbackResponse = await makeHuggingFaceRequest(apiKey, text, FALLBACK_MODEL);
    
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      return { data, modelUsed: 'fallback' };
    }
    
    throw new Error(`Both models failed: ${response.status}, ${fallbackResponse.status}`);
  } catch (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    console.log('Text length:', text.length);
    console.log('API Key length:', apiKey.length);

    const { data, modelUsed } = await tryAnalysisWithFallback(apiKey, text);
    console.log('API response data:', data);
    console.log('Model used:', modelUsed);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No sentiment analysis result received');
    }

    let sentimentResponse: SentimentAnalysisResponse;

    if (modelUsed === 'primary') {
      // Handle emotion model response
      const emotionResults = Array.isArray(data[0]) ? data[0] : data;
      
      if (!emotionResults || emotionResults.length === 0) {
        throw new Error('No emotion analysis result received');
      }

      const result = emotionResults.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      );

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

      const topEmotions = emotionResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => ({
          emotion: item.label.toLowerCase(),
          score: item.score
        }));

      sentimentResponse = {
        label: sentimentLabel,
        score: result.score,
        text: text,
        timestamp: new Date().toISOString(),
        emotions: topEmotions,
        primaryEmotion: primaryEmotion
      };
    } else {
      // Handle fallback sentiment model response
      const sentimentResults = Array.isArray(data[0]) ? data[0] : data;
      
      if (!sentimentResults || sentimentResults.length === 0) {
        throw new Error('No sentiment analysis result received');
      }

      const result = sentimentResults.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      );

      // Map fallback model labels
      let sentimentLabel = 'neutral';
      if (result.label === 'LABEL_0') {
        sentimentLabel = 'negative';
      } else if (result.label === 'LABEL_1') {
        sentimentLabel = 'neutral';
      } else if (result.label === 'LABEL_2') {
        sentimentLabel = 'positive';
      }

      sentimentResponse = {
        label: sentimentLabel,
        score: result.score,
        text: text,
        timestamp: new Date().toISOString(),
        primaryEmotion: sentimentLabel
      };
    }

    // Save to MongoDB if user is authenticated
    if (session?.user?.id) {
      try {
        console.log('Saving analysis to MongoDB for authenticated user:', session.user.id);
        await DatabaseService.saveAnalysis(session.user.id, sentimentResponse);
        console.log('Analysis saved to MongoDB for user:', session.user.id);
      } catch (dbError) {
        console.error('Failed to save analysis to MongoDB:', dbError);
        // Don't fail the request if database save fails
      }
    } else {
      console.log('No authenticated user, skipping MongoDB save');
    }

    return NextResponse.json(sentimentResponse);

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'An error occurred while analyzing sentiment.';
    if (error instanceof Error) {
      if (error.message.includes('504') || error.message.includes('503')) {
        userMessage = 'The sentiment analysis service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('429')) {
        userMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.message.includes('401')) {
        userMessage = 'Authentication error. Please check your API configuration.';
      }
    }
    
    return NextResponse.json<ApiError>(
      { 
        error: 'INTERNAL_ERROR', 
        message: userMessage
      },
      { status: 500 }
    );
  }
}
