export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Built with Next.js, TypeScript, and Tailwind CSS • 
            Powered by Hugging Face AI
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2024 Sentiment Analyzer. A portfolio project built by <a href="https://www.linkedin.com/in/arundhati-bandopadhyaya/" target="_blank" className="text-gray-600 hover:text-gray-500">Arundhati Bandopadhyaya</a> showcasing modern web development and AI integration.
          </p>
        </div>
      </div>
    </footer>
  );
}
