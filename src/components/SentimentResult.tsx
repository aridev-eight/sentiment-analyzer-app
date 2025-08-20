'use client';

import { SentimentAnalysisResponse } from '@/types';
import { 
  getSentimentColor, 
  getSentimentIcon, 
  formatConfidence, 
  getSentimentDescription,
  getEmotionColor,
  getEmotionIcon,
  getEmotionDescription
} from '@/lib/utils';

interface SentimentResultProps {
  result: SentimentAnalysisResponse;
}

export default function SentimentResult({ result }: SentimentResultProps) {
  const { label, score, text, timestamp, emotions, primaryEmotion } = result;
  const sentimentColor = getSentimentColor(label);
  const sentimentIcon = getSentimentIcon(label);
  const confidence = formatConfidence(score);
  const description = getSentimentDescription(label, score);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Analysis Result</h3>
          <span className="text-2xl">{sentimentIcon}</span>
        </div>

        {/* Primary Sentiment Badge */}
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${sentimentColor}`}>
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </span>
          <span className="text-sm text-gray-500">
            Confidence: {confidence}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {description}
        </p>

        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Confidence Level</span>
            <span className="font-medium text-gray-900">{confidence}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                label.toLowerCase() === 'positive' ? 'bg-green-500' :
                label.toLowerCase() === 'negative' ? 'bg-red-500' : 'bg-gray-500'
              }`}
              style={{ width: `${score * 100}%` }}
            />
          </div>
        </div>

        {/* Detailed Emotions */}
        {emotions && emotions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-900">Emotion Breakdown</h4>
            <div className="space-y-2">
              {emotions.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getEmotionIcon(emotion.emotion)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEmotionColor(emotion.emotion)}`}>
                      {emotion.emotion.charAt(0).toUpperCase() + emotion.emotion.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {formatConfidence(emotion.score)}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getEmotionColor(emotion.emotion).split(' ')[0]}`}
                        style={{ width: `${emotion.score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Emotion Highlight */}
        {primaryEmotion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{getEmotionIcon(primaryEmotion)}</span>
              <span className="font-medium text-blue-900">Primary Emotion</span>
            </div>
            <p className="text-blue-700 text-sm">
              {getEmotionDescription(primaryEmotion, score)}
            </p>
          </div>
        )}

        {/* Original Text */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Analyzed Text</h4>
          <p className="text-gray-800 text-sm leading-relaxed">&ldquo;{text}&rdquo;</p>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 text-center">
          Analyzed on {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
