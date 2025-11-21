import React, { useState } from 'react';
import { AppData, getAppEvidence, generateTakedownEmail } from '../services/api';
import EvidenceModal from './EvidenceModal';

interface ResultsTableProps {
  results: AppData[];
  onAppSelect: (app: AppData | null) => void;
  selectedApp: AppData | null;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  onAppSelect,
  selectedApp
}) => {
  const [evidenceModalOpen, setEvidenceModalOpen] = useState<boolean>(false);
  const [evidenceApp, setEvidenceApp] = useState<AppData | null>(null);
  const [evidenceText, setEvidenceText] = useState<string>('');
  const [evidenceLoading, setEvidenceLoading] = useState<boolean>(false);
  const [takedownEmail, setTakedownEmail] = useState<string>('');
  const [takedownLoading, setTakedownLoading] = useState<boolean>(false);

  const getRiskLevelColor = (score: number): string => {
    if (score >= 70) return '#dc3545'; // High risk - red
    if (score >= 40) return '#ffc107'; // Medium risk - yellow
    return '#28a745'; // Low risk - green
  };

  const getRiskLevelText = (score: number): string => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const getRowBackgroundColor = (score: number): string => {
    if (score >= 70) return '#ffebee'; // Light red
    if (score >= 40) return '#fff8e1'; // Light yellow
    return '#e8f5e8'; // Light green
  };

  const handleViewEvidence = async (app: AppData) => {
    setEvidenceLoading(true);
    setEvidenceApp(app);
    
    try {
      const response = await getAppEvidence(app.package_name);
      setEvidenceText(response.evidence);
      setEvidenceModalOpen(true);
    } catch (error: any) {
      console.error('Failed to get evidence:', error);
      alert('Failed to load evidence: ' + error.message);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const handleGenerateTakedown = async (app: AppData) => {
    if (!window.confirm(`Generate takedown email for "${app.app_name}"?`)) {
      return;
    }

    setTakedownLoading(true);
    
    try {
      const response = await generateTakedownEmail({ app_id: app.package_name });
      setTakedownEmail(response.email_text);
      
      // Create a new window to display the takedown email
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Takedown Email - ${app.app_name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                button { margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
              </style>
            </head>
            <body>
              <h2>Takedown Email for ${app.app_name}</h2>
              <pre>${response.email_text}</pre>
              <button onclick="window.print()">Print Email</button>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error: any) {
      console.error('Failed to generate takedown email:', error);
      alert('Failed to generate takedown email: ' + error.message);
    } finally {
      setTakedownLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = ['App Name', 'Package Name', 'Publisher', 'Brand', 'Risk Score', 'Risk Level'];
    const csvContent = [
      headers.join(','),
      ...results.map(app => [
        `"${app.app_name}"`,
        `"${app.package_name}"`,
        `"${app.publisher}"`,
        `"${app.brand.toUpperCase()}"`,
        app.risk_score,
        getRiskLevelText(app.risk_score)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake-app-detection-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <div className="no-results">
        <p>No detection results yet. Click "Run Detection" to get started.</p>
      </div>
    );
  }

  return (
    <div className="results-table-container">
      <div className="results-header">
        <h3>Detection Results ({results.length} apps)</h3>
        <button onClick={exportToCSV} className="export-btn">
          Export to CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>App Name</th>
              <th>Package Name</th>
              <th>Publisher</th>
              <th>Brand</th>
              <th>Risk Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((app, index) => (
              <tr
                key={`${app.package_name}-${index}`}
                style={{
                  backgroundColor: getRowBackgroundColor(app.risk_score),
                  fontWeight: selectedApp?.package_name === app.package_name ? 'bold' : 'normal'
                }}
                onClick={() => onAppSelect(app)}
                className="table-row"
              >
                <td className="app-name">{app.app_name}</td>
                <td className="package-name">{app.package_name}</td>
                <td className="publisher">{app.publisher}</td>
                <td className="brand">
                  <span className={`brand-badge brand-${app.brand}`}>
                    {app.brand.toUpperCase()}
                  </span>
                </td>
                <td className="risk-score">
                  <div className="risk-display">
                    <span
                      className="score-number"
                      style={{ color: getRiskLevelColor(app.risk_score) }}
                    >
                      {app.risk_score}
                    </span>
                    <span
                      className="risk-badge"
                      style={{
                        backgroundColor: getRiskLevelColor(app.risk_score),
                        color: 'white'
                      }}
                    >
                      {getRiskLevelText(app.risk_score)}
                    </span>
                  </div>
                </td>
                <td className="actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEvidence(app);
                    }}
                    disabled={evidenceLoading}
                    className="action-btn evidence-btn"
                    title="View Evidence"
                  >
                    {evidenceLoading ? 'Loading...' : '🔍 Evidence'}
                  </button>
                  {app.risk_score >= 50 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateTakedown(app);
                      }}
                      disabled={takedownLoading}
                      className="action-btn takedown-btn"
                      title="Generate Takedown Email"
                    >
                      {takedownLoading ? 'Loading...' : '📧 Takedown'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {evidenceModalOpen && evidenceApp && (
        <EvidenceModal
          app={evidenceApp}
          evidenceText={evidenceText}
          onClose={() => {
            setEvidenceModalOpen(false);
            setEvidenceApp(null);
            setEvidenceText('');
          }}
          onCopy={() => copyToClipboard(evidenceText)}
          onGenerateTakedown={() => {
            handleGenerateTakedown(evidenceApp);
            setEvidenceModalOpen(false);
          }}
        />
      )}

      <style jsx>{`
        .results-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .no-results {
          background: white;
          padding: 2rem;
          text-align: center;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: #666;
        }

        .results-header {
          display: flex;
          justify-content: between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .results-header h3 {
          margin: 0;
          color: #333;
        }

        .export-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .export-btn:hover {
          background: #218838;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
        }

        .results-table th,
        .results-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .results-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .table-row {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .table-row:hover {
          background-color: #f0f8ff !important;
        }

        .app-name {
          font-weight: 600;
          min-width: 150px;
        }

        .package-name {
          font-family: monospace;
          font-size: 0.9rem;
          color: #666;
          min-width: 200px;
        }

        .publisher {
          min-width: 150px;
        }

        .brand-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .brand-phonepe {
          background-color: #5b21b6;
        }

        .brand-paytm {
          background-color: #0891b2;
        }

        .brand-gpay {
          background-color: #ea580c;
        }

        .risk-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .score-number {
          font-weight: bold;
          font-size: 1.1rem;
          min-width: 30px;
        }

        .risk-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .actions {
          white-space: nowrap;
        }

        .action-btn {
          margin-right: 0.5rem;
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .evidence-btn {
          background-color: #007bff;
          color: white;
        }

        .evidence-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .takedown-btn {
          background-color: #dc3545;
          color: white;
        }

        .takedown-btn:hover:not(:disabled) {
          background-color: #c82333;
        }

        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .results-table {
            font-size: 0.8rem;
          }

          .results-table th,
          .results-table td {
            padding: 0.5rem;
          }

          .action-btn {
            font-size: 0.7rem;
            padding: 0.3rem 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsTable;
