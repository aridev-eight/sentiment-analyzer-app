'use client';

import { useState } from 'react';
import { analyzeSentiment } from '@/lib/api';
import { SentimentAnalysisResponse } from '@/types';
import { HistoryService } from '@/lib/history';
import SentimentResult from './SentimentResult';
import DemoSection from './DemoSection';

interface SentimentFormProps {
  onAnalysisComplete?: () => void; // Callback to trigger dashboard refresh
}

export default function SentimentForm({ onAnalysisComplete }: SentimentFormProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SentimentAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeSentiment(text);
      setResult(analysisResult);
      
      // Save to history
      HistoryService.saveAnalysis(analysisResult);
      
      // Trigger dashboard refresh
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleDemoSelect = (demoText: string) => {
    setText(demoText);
    setError(null);
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Enter text to analyze
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here to analyze its emotions and sentiment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                rows={4}
                maxLength={1000}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {text.length}/1000 characters
                </span>
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Emotions...</span>
                </div>
              ) : (
                'Analyze Emotions & Sentiment'
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">⚠️</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && <SentimentResult result={result} />}
        </div>

        {/* Demo Section */}
        <div className="lg:col-span-1">
          <DemoSection onTextSelect={handleDemoSelect} />
        </div>
      </div>
    </div>
  );
}
