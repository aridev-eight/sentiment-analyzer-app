'use client';

import { useState } from 'react';

const demoTexts = [
  "I'm absolutely thrilled about this amazing news! This is the best day ever!",
  "I'm so angry and frustrated with this terrible service. This is completely unacceptable!",
  "I'm feeling really sad and disappointed about what happened yesterday.",
  "I'm scared and worried about what might happen next. This is really frightening.",
  "I love this so much! It's absolutely perfect and makes me so happy!",
  "I'm disgusted by this behavior. It's completely repulsive and unacceptable.",
  "I'm surprised and shocked by this unexpected turn of events!",
  "I'm feeling neutral about this situation. It's neither good nor bad.",
];

interface DemoSectionProps {
  onTextSelect: (text: string) => void;
}

export default function DemoSection({ onTextSelect }: DemoSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleTextSelect = (text: string, index: number) => {
    setSelectedIndex(index);
    onTextSelect(text);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Try with emotional examples
      </h3>
      <div className="space-y-3">
        {demoTexts.map((text, index) => (
          <button
            key={index}
            onClick={() => handleTextSelect(text, index)}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
              selectedIndex === index
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <p className="text-sm text-gray-700 line-clamp-2">{text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
