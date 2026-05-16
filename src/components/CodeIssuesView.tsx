/**
 * Code Issues View Component
 * Displays extracted errors and non-optimal code with fixes
 */

import React, { useState } from 'react';
import { AlertCircle, Copy, Check, Trash2, AlertTriangle, Bug, Zap, Shield, Code } from 'lucide-react';

interface CodeIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'error' | 'performance' | 'maintainability' | 'security';
  file: string;
  line: number;
  endLine?: number;
  code: string;
  problem: string;
  fixedCode: string;
  explanation: string;
}

interface CodeIssuesViewProps {
  repoUrl: string;
  onBack: () => void;
}

const CodeIssuesView: React.FC<CodeIssuesViewProps> = ({ repoUrl, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issuesData, setIssuesData] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const analyzeIssues = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Code issues analysis failed');
      }

      setIssuesData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze code issues');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFix = (fixedCode: string, index: number) => {
    navigator.clipboard.writeText(fixedCode);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDeleteAnalysis = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setIssuesData(null);
    setShowDeleteConfirm(false);
    onBack();
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      error: Bug,
      performance: Zap,
      maintainability: Code,
      security: Shield,
    };
    return icons[category] || AlertCircle;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      error: 'text-red-600',
      performance: 'text-yellow-600',
      maintainability: 'text-blue-600',
      security: 'text-purple-600',
    };
    return colors[category] || 'text-gray-600';
  };

  // Auto-analyze on mount
  React.useEffect(() => {
    if (repoUrl && !issuesData) {
      analyzeIssues();
    }
  }, [repoUrl]);

  if (loading) {
    return (
      <div className="p-8 bg-primary-lightCream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-primary-brown mb-2">Analyzing Code Issues...</h3>
            <p className="text-primary-mutedBrown">Extracting errors and non-optimal code</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-primary-lightCream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={onBack}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issuesData) {
    return null;
  }

  const { issues = [], summary = {} } = issuesData;
  
  // Filter issues by severity
  const filteredIssues = selectedSeverity === 'all' 
    ? issues 
    : issues.filter((issue: CodeIssue) => issue.severity === selectedSeverity);

  return (
    <div className="p-8 bg-primary-lightCream min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-brown mb-2">Code Issues</h1>
            <p className="text-primary-mutedBrown">Errors and non-optimal code detected</p>
          </div>
          <button
            onClick={handleDeleteAnalysis}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Analysis
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-primary-brown mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-4 bg-primary-cream rounded-lg">
              <div className="text-3xl font-bold text-primary-orange">{summary.totalIssues || 0}</div>
              <div className="text-sm text-primary-mutedBrown mt-1">Total Issues</div>
            </div>
            {summary.bySeverity && Object.entries(summary.bySeverity).map(([severity, count]) => (
              <div key={severity} className="text-center p-4 bg-primary-cream rounded-lg">
                <div className="text-2xl font-bold text-primary-brown">{count as number}</div>
                <div className="text-xs text-primary-mutedBrown mt-1 capitalize">{severity}</div>
              </div>
            ))}
          </div>
          
          {summary.byCategory && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(summary.byCategory).map(([category, count]) => {
                const Icon = getCategoryIcon(category);
                return (
                  <div key={category} className="flex items-center gap-2 p-3 bg-primary-cream rounded-lg">
                    <Icon className={`w-5 h-5 ${getCategoryColor(category)}`} />
                    <div>
                      <div className="text-lg font-bold text-primary-brown">{count as number}</div>
                      <div className="text-xs text-primary-mutedBrown capitalize">{category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {summary.estimatedFixTime && (
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-semibold text-blue-800">
                Estimated Fix Time: {summary.estimatedFixTime}
              </span>
            </div>
          )}
        </div>

        {/* Severity Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-primary-brown">Filter by Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSeverity === severity
                    ? 'bg-primary-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-brown mb-2">
                {selectedSeverity === 'all' ? 'No Issues Found!' : `No ${selectedSeverity} severity issues`}
              </h3>
              <p className="text-primary-mutedBrown">
                {selectedSeverity === 'all' 
                  ? 'Your code appears to be clean and well-optimized.' 
                  : 'Try selecting a different severity level.'}
              </p>
            </div>
          ) : (
            filteredIssues.map((issue: CodeIssue, index: number) => {
              const Icon = getCategoryIcon(issue.category);
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${getCategoryColor(issue.category)}`} />
                        <span className="text-sm font-medium text-primary-brown capitalize">{issue.category}</span>
                      </div>
                      <span className="text-sm text-primary-mutedBrown">
                        {issue.file}:{issue.line}{issue.endLine ? `-${issue.endLine}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-primary-brown mb-2">Problem:</h4>
                    <p className="text-primary-mutedBrown">{issue.problem}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-primary-brown mb-2">Problematic Code:</h4>
                    <pre className="bg-red-50 p-4 rounded-lg overflow-x-auto text-sm border border-red-200">
                      <code className="text-red-800">{issue.code}</code>
                    </pre>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-primary-brown mb-2">Fixed Code:</h4>
                    <pre className="bg-green-50 p-4 rounded-lg overflow-x-auto text-sm border border-green-200">
                      <code className="text-green-800">{issue.fixedCode}</code>
                    </pre>
                  </div>

                  <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Why This Is Better:</h4>
                    <p className="text-blue-700 text-sm">{issue.explanation}</p>
                  </div>

                  <button
                    onClick={() => handleCopyFix(issue.fixedCode, index)}
                    className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Fixed Code
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold text-primary-brown mb-4">Confirm Delete</h3>
              <p className="text-primary-mutedBrown mb-6">
                Are you sure you want to remove this repository analysis? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-primary-brown rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeIssuesView;

// Made with Bob
