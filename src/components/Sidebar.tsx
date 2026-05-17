import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileText, AlertTriangle, Trash2, Github } from 'lucide-react';
import { getRecentRepos, repoNameToUrl } from '@/lib/recentRepos';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onNewAnalysis: () => void;
  onRecentRepoClick?: (repoUrl: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onNewAnalysis,
  onRecentRepoClick,
}) => {
  const [recentRepos, setRecentRepos] = useState<string[]>([]);

  const features = [
    { id: 'summary', name: 'App Summary', icon: FileText },
    { id: 'techdebt', name: 'Tech Debt Map', icon: AlertTriangle },
    { id: 'deadcode', name: 'Dead Code', icon: Trash2 },
  ];

  // Load recent repos from localStorage
  const loadRecentRepos = () => {
    const repos = getRecentRepos();
    setRecentRepos(repos);
  };

  // Load on mount and listen for updates
  useEffect(() => {
    loadRecentRepos();

    // Listen for custom event when repos are updated
    const handleUpdate = () => loadRecentRepos();
    window.addEventListener('recentReposUpdated', handleUpdate);

    return () => {
      window.removeEventListener('recentReposUpdated', handleUpdate);
    };
  }, []);

  const handleRecentRepoClick = (repoName: string) => {
    const fullUrl = repoNameToUrl(repoName);
    onRecentRepoClick?.(fullUrl);
  };

  return (
    <div className="w-64 h-screen bg-primary-cream border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Gorang Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <span className="text-2xl font-bold text-primary-brown">Gorang</span>
      </div>

      {/* New Analysis Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onNewAnalysis}
          className="w-full bg-primary-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          New Analysis
        </button>
      </div>

      {/* Features Section */}
      <div className="px-4 mb-6">
        <p className="text-xs text-primary-mutedBrown uppercase tracking-wider mb-3 px-2">
          Features
        </p>
        <div className="space-y-1">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeView === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => onViewChange(feature.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-primary-brown shadow-sm'
                    : 'text-primary-mutedBrown hover:bg-white hover:bg-opacity-50'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{feature.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Section */}
      <div className="px-4 mb-6">
        <p className="text-xs text-primary-mutedBrown uppercase tracking-wider mb-3 px-2">
          Recent
        </p>
        <div className="space-y-2">
          {recentRepos.length > 0 ? (
            recentRepos.map((repo) => (
              <button
                key={repo}
                onClick={() => handleRecentRepoClick(repo)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-mutedBrown hover:text-primary-brown transition-colors text-left"
              >
                <Github size={14} className="flex-shrink-0" />
                <span className="truncate">{repo}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-primary-mutedBrown italic">
              No recent repos
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

// Made with Bob
