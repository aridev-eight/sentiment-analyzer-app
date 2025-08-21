'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnalysisHistoryItem } from '@/types';
import { getSentimentColor, formatConfidence, getEmotionColor, getEmotionIcon } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'sentiment' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      
      if (session) {
        // Authenticated user - fetch from MongoDB
        console.log('Fetching history for authenticated user:', (session.user as { id?: string })?.id);
        const response = await fetch('/api/history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        const data = await response.json();
        console.log('MongoDB history data:', data);
        setAnalyses(data.analyses || []);
      } else {
        // Guest user - fetch from localStorage
        const { HistoryService } = await import('@/lib/history');
        const history = HistoryService.getHistory();
        setAnalyses(history);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    
    // Allow both authenticated and guest users to access history
    fetchAnalyses();
  }, [fetchAnalyses, status, router]);

  const deleteAnalysis = async (id: string) => {
    try {
      if (session) {
        // Authenticated user - delete from MongoDB
        const response = await fetch(`/api/history?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete analysis');
        }
      } else {
        // Guest user - delete from localStorage
        // Note: localStorage doesn't have individual delete, so we'll just remove from state
      }
      
      // Remove from local state
      setAnalyses(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete analysis');
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to delete all your analysis history? This action cannot be undone.')) {
      return;
    }

    try {
      if (session) {
        // Authenticated user - clear from MongoDB
        const response = await fetch('/api/history', {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to clear history');
        }
      } else {
        // Guest user - clear from localStorage
        const { HistoryService } = await import('@/lib/history');
        HistoryService.clearHistory();
      }
      
      setAnalyses([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
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

  // Filter and search analyses
  const filteredAnalyses = analyses.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.primaryEmotion && item.primaryEmotion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSentiment = filterSentiment === 'all' || item.label === filterSentiment;
    const matchesEmotion = filterEmotion === 'all' || item.primaryEmotion === filterEmotion;
    
    return matchesSearch && matchesSentiment && matchesEmotion;
  });

  // Sort analyses
  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'sentiment':
        comparison = a.label.localeCompare(b.label);
        break;
      case 'confidence':
        comparison = a.score - b.score;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get unique emotions for filter
  const uniqueEmotions = Array.from(new Set(analyses.map(item => item.primaryEmotion).filter(Boolean)));

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Analysis History</h1>
          <p className="text-gray-600">
            View and manage your saved sentiment and emotion analyses
          </p>
          {!session && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">💡</span>
                <p className="text-sm text-blue-700">
                  You&apos;re viewing your local history. <a href="/auth/signin" className="font-medium underline hover:text-blue-800">Sign in</a> to save your analyses permanently and access them across devices.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{analyses.length}</div>
            <div className="text-sm text-gray-600">Total Analyses</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {analyses.filter(a => a.label === 'positive').length}
            </div>
            <div className="text-sm text-gray-600">Positive</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {analyses.filter(a => a.label === 'negative').length}
            </div>
            <div className="text-sm text-gray-600">Negative</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {uniqueEmotions.length}
            </div>
            <div className="text-sm text-gray-600">Emotions Detected</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment</label>
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emotion</label>
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Emotions</option>
                {uniqueEmotions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'sentiment' | 'confidence')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="sentiment">Sentiment</option>
                  <option value="confidence">Confidence</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {sortedAnalyses.length} of {analyses.length} analyses
            </div>
            <button
              onClick={clearAllHistory}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All History
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analysis history...</p>
          </div>
        )}

        {/* Analysis List */}
        {!loading && sortedAnalyses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterSentiment !== 'all' || filterEmotion !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start analyzing text to build your history!'}
            </p>
            {!searchTerm && filterSentiment === 'all' && filterEmotion === 'all' && (
              <Link
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Analyzing
              </Link>
            )}
          </div>
        )}

        {!loading && sortedAnalyses.length > 0 && (
          <div className="space-y-4">
            {sortedAnalyses.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Analysis Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpandedItem(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(item.label)}`}>
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
                      <span className="text-sm text-gray-500">
                        {formatConfidence(item.score)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnalysis(item.id);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete analysis"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedItems.has(item.id) ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 line-clamp-2">{item.textPreview}</p>
                </div>

                {/* Expanded Details */}
                {expandedItems.has(item.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="space-y-4">
                      {/* Full Text */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Full Text</h4>
                        <p className="text-gray-800 bg-white p-4 rounded border">&ldquo;{item.text}&rdquo;</p>
                      </div>

                      {/* Emotions Breakdown */}
                      {item.emotions && item.emotions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Emotion Breakdown</h4>
                                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {item.emotions.map((emotion, index) => (
                               <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
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
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
