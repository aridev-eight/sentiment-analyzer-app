'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SentimentForm from '@/components/SentimentForm';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Footer from '@/components/Footer';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnalysisComplete = () => {
    // Increment trigger to refresh dashboard
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Emotion & Sentiment Analysis
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze text emotions and sentiment using advanced AI. Detect joy, anger, sadness, fear, 
            love, surprise, disgust, and more with detailed confidence scores.
          </p>
        </div>

        <SentimentForm onAnalysisComplete={handleAnalysisComplete} />

        {/* Analytics Dashboard */}
        <div className="mt-16">
          <AnalyticsDashboard refreshTrigger={refreshTrigger} />
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">🎭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Emotion Detection</h3>
            <p className="text-gray-600 text-sm">
              Detect 8 different emotions: joy, love, surprise, anger, sadness, fear, disgust, and neutral.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 text-sm">
              View key metrics and sentiment distribution patterns with live updates.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">
              Get instant emotion analysis results with confidence scores and detailed breakdowns.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
