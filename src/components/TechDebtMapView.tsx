/**
 * Tech Debt Map View Component
 * Displays architecture diagrams and technical debt analysis
 */

import React, { useState } from 'react';
import { AlertCircle, Database, Code, AlertTriangle, Lightbulb, Trash2 } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';

interface TechDebtMapViewProps {
  repoUrl: string;
  onBack: () => void;
}

const TechDebtMapView: React.FC<TechDebtMapViewProps> = ({ repoUrl, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [techDebtData, setTechDebtData] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const analyzeTechDebt = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze/techdebt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Tech debt analysis failed');
      }

      setTechDebtData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze tech debt');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setTechDebtData(null);
    setShowDeleteConfirm(false);
    onBack();
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Auto-analyze on mount
  React.useEffect(() => {
    if (repoUrl && !techDebtData) {
      analyzeTechDebt();
    }
  }, [repoUrl]);

  if (loading) {
    return (
      <div className="p-8 bg-primary-lightCream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-primary-brown mb-2">Analyzing Architecture...</h3>
            <p className="text-primary-mutedBrown">Mapping technical debt and system architecture</p>
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

  if (!techDebtData) {
    return null;
  }

  const {
    hasDatabase,
    databaseArchitecture,
    codeArchitecture,
    legacyPatterns,
    lowCodeDetection,
    techDebtAreas = [],
    diagramData,
  } = techDebtData;

  return (
    <div className="p-8 bg-primary-lightCream min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-brown mb-2">Tech Debt Map</h1>
            <p className="text-primary-mutedBrown">Architecture visualization and technical debt analysis</p>
          </div>
          <button
            onClick={handleDeleteAnalysis}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Analysis
          </button>
        </div>

        {/* Architecture Diagram */}
        {diagramData && diagramData.mermaidCode && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-primary-orange" />
              System Architecture Diagram
            </h2>
            <div className="bg-primary-cream p-6 rounded-lg overflow-x-auto">
              <MermaidDiagram chart={diagramData.mermaidCode} />
            </div>
          </div>
        )}

        {/* Database Architecture */}
        {hasDatabase && databaseArchitecture && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary-orange" />
              Database Architecture
            </h2>
            <div className="mb-4">
              <span className="text-sm font-semibold text-primary-mutedBrown">Type:</span>
              <span className="ml-2 text-primary-brown">{databaseArchitecture.type}</span>
            </div>
            {databaseArchitecture.tables && databaseArchitecture.tables.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-primary-brown">Tables:</h3>
                {databaseArchitecture.tables.map((table: any, idx: number) => (
                  <div key={idx} className="bg-primary-cream p-4 rounded-lg">
                    <h4 className="font-semibold text-primary-brown mb-2">{table.name}</h4>
                    {table.keys && table.keys.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-primary-mutedBrown">Keys: </span>
                        <span className="text-sm text-primary-brown">{table.keys.join(', ')}</span>
                      </div>
                    )}
                    {table.relationships && table.relationships.length > 0 && (
                      <div>
                        <span className="text-sm text-primary-mutedBrown">Relationships: </span>
                        <ul className="list-disc list-inside text-sm text-primary-brown">
                          {table.relationships.map((rel: string, i: number) => (
                            <li key={i}>{rel}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Architecture */}
        {codeArchitecture && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-primary-orange" />
              Code Architecture
            </h2>
            
            {codeArchitecture.entryPoints && codeArchitecture.entryPoints.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary-brown mb-2">Entry Points:</h3>
                <div className="flex flex-wrap gap-2">
                  {codeArchitecture.entryPoints.map((entry: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-primary-cream text-primary-brown rounded-full text-sm">
                      {entry}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {codeArchitecture.apiRoutes && codeArchitecture.apiRoutes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary-brown mb-2">API Routes:</h3>
                <div className="flex flex-wrap gap-2">
                  {codeArchitecture.apiRoutes.map((route: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {route}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {codeArchitecture.modules && codeArchitecture.modules.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary-brown mb-2">Modules:</h3>
                <div className="space-y-3">
                  {codeArchitecture.modules.map((module: any, idx: number) => (
                    <div key={idx} className="bg-primary-cream p-4 rounded-lg">
                      <h4 className="font-semibold text-primary-brown">{module.name}</h4>
                      <p className="text-sm text-primary-mutedBrown">{module.path}</p>
                      {module.dependencies && module.dependencies.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-primary-mutedBrown">Depends on: </span>
                          <span className="text-primary-brown">{module.dependencies.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legacy Patterns */}
        {legacyPatterns && legacyPatterns.detected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Legacy System Patterns
            </h2>
            <div className="mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {legacyPatterns.language}
              </span>
            </div>
            {legacyPatterns.issues && legacyPatterns.issues.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary-brown mb-2">Issues:</h3>
                <ul className="list-disc list-inside space-y-1 text-primary-mutedBrown">
                  {legacyPatterns.issues.map((issue: string, idx: number) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {legacyPatterns.modernizationPath && (
              <div className="bg-primary-cream p-4 rounded-lg">
                <h3 className="font-semibold text-primary-brown mb-2">Modernization Path:</h3>
                <p className="text-primary-mutedBrown">{legacyPatterns.modernizationPath}</p>
              </div>
            )}
          </div>
        )}

        {/* Low Code Detection */}
        {lowCodeDetection && lowCodeDetection.detected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              Low-Code Opportunities
            </h2>
            {lowCodeDetection.tools && lowCodeDetection.tools.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary-brown mb-2">Detected Tools:</h3>
                <div className="flex flex-wrap gap-2">
                  {lowCodeDetection.tools.map((tool: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {lowCodeDetection.opportunities && lowCodeDetection.opportunities.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary-brown mb-2">Opportunities:</h3>
                <ul className="list-disc list-inside space-y-1 text-primary-mutedBrown">
                  {lowCodeDetection.opportunities.map((opp: string, idx: number) => (
                    <li key={idx}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Technical Debt Areas */}
        {techDebtAreas.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-primary-brown mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Technical Debt Areas
            </h2>
            <div className="space-y-4">
              {techDebtAreas.map((area: any, idx: number) => (
                <div key={idx} className="border-l-4 border-primary-orange pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-primary-brown">{area.area}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(area.severity)}`}>
                      {area.severity}
                    </span>
                  </div>
                  <p className="text-primary-mutedBrown mb-2">{area.description}</p>
                  {area.impact && (
                    <p className="text-sm text-primary-mutedBrown mb-2">
                      <span className="font-semibold">Impact:</span> {area.impact}
                    </p>
                  )}
                  {area.recommendation && (
                    <div className="bg-primary-cream p-3 rounded-lg mt-2">
                      <p className="text-sm text-primary-brown">
                        <span className="font-semibold">Recommendation:</span> {area.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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

export default TechDebtMapView;

// Made with Bob
