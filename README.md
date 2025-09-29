# Sentiment Analyzer

A modern, real-time sentiment analysis web application built with Next.js 14, TypeScript, and Tailwind CSS. This project demonstrates the integration of machine learning APIs for text sentiment analysis, perfect for portfolio showcases and learning purposes.

## 🚀 Features

- **Real-time Sentiment Analysis**: Instant analysis using Hugging Face's state-of-the-art models
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Comprehensive error handling and user feedback
- **Mobile Responsive**: Optimized for all device sizes
- **Loading States**: Smooth loading indicators and user feedback
- **Confidence Scoring**: Detailed confidence levels for each analysis

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: Hugging Face Inference API
- **Deployment**: Vercel (ready)
- **Development**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Hugging Face API key

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/arundhati-work/sentiment-analyzer-app.git
cd sentiment-analyzer-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
HUGGING_FACE_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_NAME=Sentiment Analyzer
```

### 4. Get your Hugging Face API key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings → Access Tokens
4. Create a new token with read permissions
5. Copy the token to your `.env.local` file

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── analyze-sentiment/
│   │       └── route.ts          # API endpoint for sentiment analysis
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── Header.tsx                # Application header
│   ├── SentimentForm.tsx         # Main form component
│   └── SentimentResult.tsx       # Results display component
├── lib/
│   ├── api.ts                    # API utility functions
│   └── utils.ts                  # Utility functions
└── types/
    └── index.ts                  # TypeScript type definitions
```

## 🔧 API Endpoints

### POST /api/analyze-sentiment

Analyzes the sentiment of provided text.

**Request Body:**
```json
{
  "text": "Your text to analyze"
}
```

**Response:**
```json
{
  "label": "positive|negative|neutral",
  "score": 0.95,
  "text": "Your text to analyze",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Design System

The application uses a modern, minimalist design with:

- **Color Palette**: Professional grays, blues, and accent colors
- **Typography**: Inter font family for clean readability
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable, accessible components
- **Animations**: Subtle transitions and micro-interactions

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `HUGGING_FACE_API_KEY`
- `NEXT_PUBLIC_APP_NAME`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing the sentiment analysis API
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Contact

Arundhati Bandopadhyaya - [arundhatib.work@gmail.com](mailto:arundhatib.work@gmail.com)
