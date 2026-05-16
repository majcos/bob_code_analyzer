import React from 'react';
import Image from 'next/image';
import { Link2, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  repoUrl: string;
  onRepoUrlChange: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({
  repoUrl,
  onRepoUrlChange,
  onAnalyze,
  loading,
}) => {
  const demoRepos = [
    { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
    { name: 'facebook/react', url: 'https://github.com/facebook/react' },
    { name: 'vuejs/vue', url: 'https://github.com/vuejs/vue' },
  ];

  const handleDemoClick = (url: string) => {
    onRepoUrlChange(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onAnalyze();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-primary-lightCream">
      <div className="max-w-3xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="Gorang Logo"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-primary-brown text-center mb-4">
          Analyze any GitHub Repository
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-primary-mutedBrown text-center mb-12">
          Paste a GitHub repo URL below and let IBM Bob analyze your codebase
        </p>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-mutedBrown">
              <Link2 size={20} />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => onRepoUrlChange(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full pl-12 pr-40 py-4 text-base text-primary-brown border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent placeholder:text-gray-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-orange text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Repos */}
        <div className="text-center">
          <p className="text-sm text-primary-mutedBrown mb-4">Try a demo repo:</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {demoRepos.map((repo) => (
              <button
                key={repo.name}
                onClick={() => handleDemoClick(repo.url)}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-primary-brown hover:border-primary-orange hover:text-primary-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {repo.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

// Made with Bob
