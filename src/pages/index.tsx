/**
 * Main Dashboard Interface
 * GitHub Repository Analyzer - Redesigned with Gorang Theme
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import LandingPage from '@/components/LandingPage';
import DeadCodeView from '@/components/DeadCodeView';
import TechDebtMapView from '@/components/TechDebtMapView';
import CodeIssuesView from '@/components/CodeIssuesView';
import { Star, GitFork, Eye, AlertCircle, Users, GitCommit, FileCode, Package, Brain, Shield, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { addRecentRepo } from '@/lib/recentRepos';

interface AIAnalysis {
  codeQualitySummary: string;
  securityIssues: string[];
  suggestedImprovements: string[];
  techStackExplanation: string;
  overallHealthScore: number;
  strengths: string[];
  weaknesses: string[];
  bestPractices: string[];
  recommendations: string[];
}

interface RepoData {
  repo: {
    name: string;
    fullName: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    license: string;
    defaultBranch: string;
    createdAt: string;
    updatedAt: string;
  };
  languages: {
    primary: string;
    breakdown: Array<{
      language: string;
      percentage: string;
      bytes: number;
    }>;
  };
  fileStructure: Array<{
    path: string;
    type: string;
    size?: number;
  }>;
  commits: Array<{
    message: string;
    author: string;
    date: string;
    sha: string;
  }>;
  contributors: {
    total: number;
    list: Array<{
      name: string;
      contributions: number;
      avatar: string;
    }>;
  };
  readme: string;
  dependencies: {
    type: string;
    list: Array<{
      name: string;
      version: string;
    }>;
  } | null;
  aiAnalysis?: AIAnalysis;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [activeView, setActiveView] = useState('summary');
  const [demoMode, setDemoMode] = useState(false);
  const [currentRepoUrl, setCurrentRepoUrl] = useState('');

  const analyzeRepo = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError('');
    setRepoData(null);

    try {
      const response = await fetch('/api/analyze/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      setRepoData(result.data);
      setCurrentRepoUrl(repoUrl.trim());
      
      // Add to recent repos on successful analysis
      addRecentRepo(repoUrl.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setRepoUrl('');
    setRepoData(null);
    setError('');
    setActiveView('summary');
    setCurrentRepoUrl('');
  };

  const handleBackToSummary = () => {
    setActiveView('summary');
  };

  const handleDemoModeToggle = () => {
    setDemoMode(!demoMode);
  };

  const handleRecentRepoClick = (repoUrl: string) => {
    setRepoUrl(repoUrl);
    // Auto-trigger analysis when clicking a recent repo
    setTimeout(() => {
      const urlInput = repoUrl;
      if (urlInput) {
        setRepoUrl(urlInput);
        // Trigger analysis after state update
        setTimeout(() => {
          analyzeRepo();
        }, 100);
      }
    }, 100);
  };

  return (
    <>
      <Head>
        <title>Gorang - GitHub Repository Analyzer</title>
        <meta name="description" content="Analyze GitHub repositories with AI-powered insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="flex min-h-screen bg-primary-lightCream font-sans">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          demoMode={demoMode}
          onDemoModeToggle={handleDemoModeToggle}
          onNewAnalysis={handleNewAnalysis}
          onRecentRepoClick={handleRecentRepoClick}
        />

        {/* Main Content */}
        <div className="ml-64 flex-1">
          {!repoData && activeView === 'summary' ? (
            <LandingPage
              repoUrl={repoUrl}
              onRepoUrlChange={setRepoUrl}
              onAnalyze={analyzeRepo}
              loading={loading}
            />
          ) : activeView === 'deadcode' ? (
            <DeadCodeView
              repoUrl={currentRepoUrl || repoUrl}
              onBack={handleBackToSummary}
            />
          ) : activeView === 'techdebt' ? (
            <TechDebtMapView
              repoUrl={currentRepoUrl || repoUrl}
              onBack={handleBackToSummary}
            />
          ) : activeView === 'issues' ? (
            <CodeIssuesView
              repoUrl={currentRepoUrl || repoUrl}
              onBack={handleBackToSummary}
            />
          ) : repoData ? (
            <div className="p-8 bg-primary-lightCream min-h-screen">
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-red-800">{error}</div>
                </div>
              )}

              {/* Results Dashboard */}
              <div className="space-y-6">
                {/* AI Analysis Section */}
                {repoData.aiAnalysis && (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-primary-brown mb-4 flex items-center gap-2">
                      <Brain className="w-7 h-7 text-primary-orange" />
                      AI-Powered Code Analysis
                    </h2>

                    {/* Overall Health Score */}
                    <div className="bg-primary-cream rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-primary-brown">Overall Code Health Score</h3>
                        <div className="text-4xl font-bold text-primary-orange">
                          {repoData.aiAnalysis.overallHealthScore}/100
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            repoData.aiAnalysis.overallHealthScore >= 80
                              ? 'bg-green-500'
                              : repoData.aiAnalysis.overallHealthScore >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${repoData.aiAnalysis.overallHealthScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Code Quality Summary */}
                    <div className="bg-primary-cream rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-bold text-primary-brown mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Code Quality Summary
                      </h3>
                      <p className="text-primary-brown leading-relaxed">{repoData.aiAnalysis.codeQualitySummary}</p>
                    </div>

                    {/* Tech Stack Explanation */}
                    <div className="bg-primary-cream rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-bold text-primary-brown mb-3 flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary-orange" />
                        Technology Stack Analysis
                      </h3>
                      <p className="text-primary-brown leading-relaxed">{repoData.aiAnalysis.techStackExplanation}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      {repoData.aiAnalysis.strengths.length > 0 && (
                        <div className="bg-primary-cream rounded-lg p-6">
                          <h3 className="text-lg font-bold text-primary-brown mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Strengths
                          </h3>
                          <ul className="space-y-2">
                            {repoData.aiAnalysis.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-primary-brown">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {repoData.aiAnalysis.weaknesses.length > 0 && (
                        <div className="bg-primary-cream rounded-lg p-6">
                          <h3 className="text-lg font-bold text-primary-brown mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            Areas for Improvement
                          </h3>
                          <ul className="space-y-2">
                            {repoData.aiAnalysis.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-primary-brown">
                                <XCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-1" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Security Issues */}
                    {repoData.aiAnalysis.securityIssues.length > 0 && (
                      <div className="bg-primary-cream rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-bold text-primary-brown mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-600" />
                          Security Analysis
                        </h3>
                        <ul className="space-y-2">
                          {repoData.aiAnalysis.securityIssues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-primary-brown">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {repoData.aiAnalysis.recommendations.length > 0 && (
                      <div className="bg-primary-cream rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-bold text-primary-brown mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary-orange" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {repoData.aiAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-primary-brown">
                              <CheckCircle className="w-4 h-4 text-primary-orange flex-shrink-0 mt-1" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Repository Overview */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-primary-brown mb-4">
                    {repoData.repo.name}
                  </h2>
                  <p className="text-primary-mutedBrown mb-4">{repoData.repo.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold text-primary-brown">
                          {repoData.repo.stars.toLocaleString()}
                        </div>
                        <div className="text-sm text-primary-mutedBrown">Stars</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork className="w-5 h-5 text-primary-orange" />
                      <div>
                        <div className="text-2xl font-bold text-primary-brown">
                          {repoData.repo.forks.toLocaleString()}
                        </div>
                        <div className="text-sm text-primary-mutedBrown">Forks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold text-primary-brown">
                          {repoData.repo.watchers.toLocaleString()}
                        </div>
                        <div className="text-sm text-primary-mutedBrown">Watchers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="text-2xl font-bold text-primary-brown">
                          {repoData.repo.openIssues.toLocaleString()}
                        </div>
                        <div className="text-sm text-primary-mutedBrown">Open Issues</div>
                      </div>
                    </div>
                  </div>
                  <a
                    href={repoData.repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-primary-orange hover:text-primary-brown font-medium transition-colors"
                  >
                    View on GitHub →
                  </a>
                </div>

                {/* Languages */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
                    <FileCode className="w-6 h-6 text-primary-orange" />
                    Programming Languages
                  </h3>
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-primary-brown">
                      Primary: {repoData.languages.primary}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {repoData.languages.breakdown.map((lang) => (
                      <div key={lang.language}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-primary-brown">{lang.language}</span>
                          <span className="text-primary-mutedBrown">{lang.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-orange h-2 rounded-full"
                            style={{ width: `${lang.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Commits */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
                    <GitCommit className="w-6 h-6 text-primary-orange" />
                    Recent Commits
                  </h3>
                  <div className="space-y-4">
                    {repoData.commits.map((commit, idx) => (
                      <div key={idx} className="border-l-4 border-primary-orange pl-4 py-2">
                        <div className="font-medium text-primary-brown">{commit.message}</div>
                        <div className="text-sm text-primary-mutedBrown mt-1">
                          <span className="font-semibold">{commit.author}</span> •{' '}
                          {new Date(commit.date).toLocaleDateString()} •{' '}
                          <code className="bg-primary-cream px-2 py-1 rounded">{commit.sha}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contributors */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary-orange" />
                    Contributors ({repoData.contributors.total})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {repoData.contributors.list.slice(0, 12).map((contributor, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-primary-cream rounded-lg">
                        <img
                          src={contributor.avatar}
                          alt={contributor.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-primary-brown text-sm">
                            {contributor.name}
                          </div>
                          <div className="text-xs text-primary-mutedBrown">
                            {contributor.contributions} commits
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                {repoData.dependencies && (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
                      <Package className="w-6 h-6 text-primary-orange" />
                      Dependencies ({repoData.dependencies.type})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {repoData.dependencies.list.slice(0, 30).map((dep, idx) => (
                        <div key={idx} className="bg-primary-cream rounded-lg p-3">
                          <div className="font-medium text-primary-brown text-sm">{dep.name}</div>
                          <div className="text-xs text-primary-mutedBrown">{dep.version}</div>
                        </div>
                      ))}
                    </div>
                    {repoData.dependencies.list.length > 30 && (
                      <div className="mt-4 text-sm text-primary-mutedBrown">
                        ... and {repoData.dependencies.list.length - 30} more dependencies
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

// Made with Bob
