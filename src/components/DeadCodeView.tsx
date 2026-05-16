/**
 * Dead Code View Component
 * Displays dead code analysis results with delete suggestions
 */

import React, { useState } from 'react';
import { Trash2, AlertCircle, Copy, Check, X } from 'lucide-react';

interface DeadCodeItem {
  type: string;
  file: string;
  line: number;
  endLine?: number;
  code: string;
  reason: string;
  suggestion: string;
}

interface DeadCodeViewProps {
  repoUrl: string;
  onBack: () => void;
}

const DeadCodeView: React.FC<DeadCodeViewProps> = ({ repoUrl, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deadCodeData, setDeadCodeData] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const analyzeDeadCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze/deadcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Dead code analysis failed');
      }

      setDeadCodeData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze dead code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySuggestion = (suggestion: string, index: number) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDeleteAnalysis = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setDeadCodeData(null);
    setShowDeleteConfirm(false);
    onBack();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      unused_function: 'bg-orange-100 text-orange-800 border-orange-200',
      unused_variable: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unused_import: 'bg-blue-100 text-blue-800 border-blue-200',
      unused_file: 'bg-red-100 text-red-800 border-red-200',
      commented_code: 'bg-gray-100 text-gray-800 border-gray-200',
      duplicate_code: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      unused_function: 'Unused Function',
      unused_variable: 'Unused Variable',
      unused_import: 'Unused Import',
      unused_file: 'Unused File',
      commented_code: 'Commented Code',
      duplicate_code: 'Duplicate Code',
    };
    return labels[type] || type;
  };

  // Auto-analyze on mount
  React.useEffect(() => {
    if (repoUrl && !deadCodeData) {
      analyzeDeadCode();
    }
  }, [repoUrl]);

  if (loading) {
    return (
      <div className="p-8 bg-primary-lightCream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-primary-brown mb-2">Analyzing Dead Code...</h3>
            <p className="text-primary-mutedBrown">This may take a moment</p>
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

  if (!deadCodeData) {
    return null;
  }

  const { deadCodeItems = [], summary = {} } = deadCodeData;

  return (
    <div className="p-8 bg-primary-lightCream min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-brown mb-2">Dead Code Analysis</h1>
            <p className="text-primary-mutedBrown">Unused code detected in your repository</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-primary-cream rounded-lg">
              <div className="text-3xl font-bold text-primary-orange">{summary.totalIssues || 0}</div>
              <div className="text-sm text-primary-mutedBrown mt-1">Total Issues</div>
            </div>
            {summary.byType && Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-primary-cream rounded-lg">
                <div className="text-2xl font-bold text-primary-brown">{count as number}</div>
                <div className="text-xs text-primary-mutedBrown mt-1">{getTypeLabel(type)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dead Code Items */}
        <div className="space-y-4">
          {deadCodeItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-brown mb-2">No Dead Code Found!</h3>
              <p className="text-primary-mutedBrown">Your codebase appears to be clean.</p>
            </div>
          ) : (
            deadCodeItems.map((item: DeadCodeItem, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                    <span className="text-sm text-primary-mutedBrown">
                      {item.file}:{item.line}{item.endLine ? `-${item.endLine}` : ''}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-brown mb-2">Code:</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
                    <code className="text-primary-brown">{item.code}</code>
                  </pre>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-brown mb-2">Reason:</h4>
                  <p className="text-primary-mutedBrown">{item.reason}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-primary-brown mb-2">Suggestion:</h4>
                  <p className="text-primary-mutedBrown">{item.suggestion}</p>
                </div>

                <button
                  onClick={() => handleCopySuggestion(item.suggestion, index)}
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
                      Copy Suggestion
                    </>
                  )}
                </button>
              </div>
            ))
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

export default DeadCodeView;

// Made with Bob
