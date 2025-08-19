export function getSentimentColor(label: string): string {
  switch (label.toLowerCase()) {
    case 'positive':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'negative':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'neutral':
      return 'text-gray-600 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

export function getEmotionColor(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case 'joy':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'love':
      return 'text-pink-600 bg-pink-100 border-pink-200';
    case 'surprise':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'anger':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'sadness':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'fear':
      return 'text-purple-600 bg-purple-100 border-purple-200';
    case 'disgust':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'neutral':
      return 'text-gray-600 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

export function getSentimentIcon(label: string): string {
  switch (label.toLowerCase()) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😞';
    case 'neutral':
      return '😐';
    default:
      return '🤔';
  }
}

export function getEmotionIcon(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case 'joy':
      return '😊';
    case 'love':
      return '🥰';
    case 'surprise':
      return '😲';
    case 'anger':
      return '😠';
    case 'sadness':
      return '😢';
    case 'fear':
      return '😨';
    case 'disgust':
      return '🤢';
    case 'neutral':
      return '😐';
    default:
      return '🤔';
  }
}

export function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export function getSentimentDescription(label: string, score: number): string {
  const confidence = formatConfidence(score);
  switch (label.toLowerCase()) {
    case 'positive':
      return `Positive sentiment detected with ${confidence} confidence`;
    case 'negative':
      return `Negative sentiment detected with ${confidence} confidence`;
    case 'neutral':
      return `Neutral sentiment detected with ${confidence} confidence`;
    default:
      return `Sentiment analysis completed with ${confidence} confidence`;
  }
}

export function getEmotionDescription(emotion: string, score: number): string {
  const confidence = formatConfidence(score);
  const emotionName = emotion.charAt(0).toUpperCase() + emotion.slice(1);
  return `${emotionName} emotion detected with ${confidence} confidence`;
}
