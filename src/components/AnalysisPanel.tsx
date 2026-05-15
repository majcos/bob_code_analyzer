/**
 * Analysis Panel Component
 * Displays analysis results with Bob's prompt and response
 */

import React from 'react';
import { Loader2, FileCode, AlertCircle } from 'lucide-react';
import type { BobAnalysisResponse } from '@/types';

interface AnalysisPanelProps {
  title: string;
  description: string;
  loading: boolean;
  error: string | null;
  result: BobAnalysisResponse | null;
  onAnalyze: () => void;
  children?: React.ReactNode;
}

export default function AnalysisPanel({
  title,
  description,
  loading,
  error,
  result,
  onAnalyze,
  children,
}: AnalysisPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {children}

      <button
        onClick={onAnalyze}
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing with Bob...
          </>
        ) : (
          <>
            <FileCode className="w-5 h-5" />
            Analyze with Bob
          </>
        )}
      </button>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Bob's Analysis Result */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h3 className="font-bold text-gray-900">Bob's Analysis</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-800 font-sans">
                {result.result}
              </pre>
            </div>
          </div>

          {/* Files Analyzed */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600">
              Files Analyzed ({result.filesAnalyzed.length})
            </summary>
            <ul className="mt-3 space-y-1">
              {result.filesAnalyzed.map((file, index) => (
                <li key={index} className="text-sm text-gray-700 font-mono">
                  📄 {file}
                </li>
              ))}
            </ul>
          </details>

          {/* Prompt Used */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600">
              Prompt Sent to Bob
            </summary>
            <pre className="mt-3 text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-300 overflow-x-auto">
              {result.promptUsed}
            </pre>
          </details>

          {/* Metadata */}
          <div className="text-xs text-gray-500 flex items-center gap-4">
            <span>Feature: {result.feature}</span>
            <span>•</span>
            <span>Analyzed: {new Date(result.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
