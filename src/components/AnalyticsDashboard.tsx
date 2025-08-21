'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AnalyticsData } from '@/types';
import { HistoryService } from '@/lib/history';
import { getSentimentColor, formatConfidence } from '@/lib/utils';

interface AnalyticsDashboardProps {
  refreshTrigger?: number; // Add prop to trigger refresh
}

export default function AnalyticsDashboard({ refreshTrigger = 0 }: AnalyticsDashboardProps) {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    updateAnalytics();
  }, [refreshTrigger]); // Refresh when trigger changes

  const updateAnalytics = () => {
    setAnalytics(HistoryService.getAnalytics());
  };



  if (!analytics) return null;

  const { totalAnalyses, sentimentDistribution, averageConfidence } = analytics;

  if (totalAnalyses === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
        <p className="text-gray-500 text-center py-8">
          No analyses yet. Start analyzing text to see your statistics!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{totalAnalyses}</div>
          <div className="text-sm text-blue-700">Total Analyses</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatConfidence(averageConfidence)}
          </div>
          <div className="text-sm text-green-700">Avg Confidence</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((sentimentDistribution.positive / totalAnalyses) * 100)}%
          </div>
          <div className="text-sm text-purple-700">Positive Rate</div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Sentiment Distribution</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(sentimentDistribution).map(([sentiment, count]) => {
            const percentage = Math.round((count / totalAnalyses) * 100);
            return (
              <div key={sentiment} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(sentiment)}`}>
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">{percentage}%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{count}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      sentiment === 'positive' ? 'bg-green-500' : 
                      sentiment === 'negative' ? 'bg-red-500' : 
                      'bg-gray-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={() => {
            HistoryService.clearHistory();
            updateAnalytics();
          }}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Clear History
        </button>
        {session && (
          <a
            href="/history"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Full History →
          </a>
        )}
      </div>
    </div>
  );
}
