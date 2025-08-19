'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData, AnalysisHistoryItem } from '@/types';
import { HistoryService } from '@/lib/history';
import { getSentimentColor, formatConfidence, getEmotionColor, getEmotionIcon } from '@/lib/utils';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  useEffect(() => {
    updateAnalytics();
  }, []);

  const updateAnalytics = () => {
    setAnalytics(HistoryService.getAnalytics());
  };

  const toggleExpandedItem = (itemId: string) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(itemId)) {
      newExpandedItems.delete(itemId);
    } else {
      newExpandedItems.add(itemId);
    }
    setExpandedItems(newExpandedItems);
  };

  // Filter and search history items
  const filteredHistory = analytics?.recentAnalyses.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.primaryEmotion && item.primaryEmotion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterSentiment === 'all' || item.label === filterSentiment;
    
    return matchesSearch && matchesFilter;
  }) || [];

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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
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
        <div className="space-y-2">
          {Object.entries(sentimentDistribution).map(([sentiment, count]) => (
            <div key={sentiment} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(sentiment)}`}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </span>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
              <div className="text-sm text-gray-500">
                {Math.round((count / totalAnalyses) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis History */}
      {isExpanded && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Analysis History</h4>
          
          {/* Search and Filter Controls */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            
            {filteredHistory.length > 0 && (
              <div className="text-sm text-gray-500">
                Showing {filteredHistory.length} of {analytics.recentAnalyses.length} analyses
              </div>
            )}
          </div>

          {/* History Items */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* History Item Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpandedItem(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(item.label)}`}>
                          {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                        </span>
                        {item.primaryEmotion && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm">{getEmotionIcon(item.primaryEmotion)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getEmotionColor(item.primaryEmotion)}`}>
                              {item.primaryEmotion.charAt(0).toUpperCase() + item.primaryEmotion.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          {formatConfidence(item.score)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          {expandedItems.has(item.id) ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{item.textPreview}</p>
                  </div>

                  {/* Expanded Details */}
                  {expandedItems.has(item.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-3">
                        {/* Full Text */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Full Text</h5>
                          <p className="text-sm text-gray-800 bg-white p-3 rounded border">"{item.text}"</p>
                        </div>

                        {/* Emotions Breakdown */}
                        {item.emotions && item.emotions.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Emotion Breakdown</h5>
                            <div className="space-y-2">
                              {item.emotions.map((emotion, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">{getEmotionIcon(emotion.emotion)}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEmotionColor(emotion.emotion)}`}>
                                      {emotion.emotion.charAt(0).toUpperCase() + emotion.emotion.slice(1)}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {formatConfidence(emotion.score)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-xs text-gray-500">
                          Analyzed on {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterSentiment !== 'all' 
                  ? 'No analyses match your search criteria.' 
                  : 'No analyses found.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear History Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            HistoryService.clearHistory();
            updateAnalytics();
            setExpandedItems(new Set());
            setSearchTerm('');
            setFilterSentiment('all');
          }}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Clear History
        </button>
      </div>
    </div>
  );
}
