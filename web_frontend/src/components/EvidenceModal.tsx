import React from 'react';
import { AppData } from '../services/api';

interface EvidenceModalProps {
  app: AppData;
  evidenceText: string;
  onClose: () => void;
  onCopy: () => void;
  onGenerateTakedown: () => void;
}

const EvidenceModal: React.FC<EvidenceModalProps> = ({
  app,
  evidenceText,
  onClose,
  onCopy,
  onGenerateTakedown
}) => {
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

  const getBrandColor = (brand: string): string => {
    switch (brand) {
      case 'phonepe': return '#5b21b6';
      case 'paytm': return '#0891b2';
      case 'gpay': return '#ea580c';
      default: return '#666';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="app-info">
            <h2>{app.app_name}</h2>
            <div className="app-details">
              <span 
                className="brand-badge"
                style={{ backgroundColor: getBrandColor(app.brand) }}
              >
                {app.brand.toUpperCase()}
              </span>
              <span 
                className="risk-score-badge"
                style={{ backgroundColor: getRiskLevelColor(app.risk_score) }}
              >
                Risk Score: {app.risk_score}/100 ({getRiskLevelText(app.risk_score)})
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="app-meta">
            <div className="meta-item">
              <strong>Package Name:</strong> {app.package_name}
            </div>
            <div className="meta-item">
              <strong>Publisher:</strong> {app.publisher}
            </div>
            {app.is_official !== undefined && (
              <div className="meta-item">
                <strong>Official:</strong> 
                <span className={`official-status ${app.is_official ? 'official' : 'unofficial'}`}>
                  {app.is_official ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>

          <div className="evidence-section">
            <h3>Evidence Report</h3>
            <div className="evidence-content">
              <pre>{evidenceText}</pre>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="copy-btn" onClick={onCopy}>
            📋 Copy Evidence
          </button>
          {app.risk_score >= 50 && (
            <button className="takedown-btn" onClick={onGenerateTakedown}>
              📧 Generate Takedown Email
            </button>
          )}
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 1rem;
          }

          .modal-content {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 1.5rem;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            border-radius: 8px 8px 0 0;
          }

          .app-info h2 {
            margin: 0 0 0.5rem 0;
            color: #333;
            font-size: 1.5rem;
          }

          .app-details {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }

          .brand-badge,
          .risk-score-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
            text-transform: uppercase;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 2rem;
            color: #666;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
          }

          .close-btn:hover {
            background-color: #f0f0f0;
            color: #333;
          }

          .modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            flex: 1;
          }

          .app-meta {
            margin-bottom: 1.5rem;
          }

          .meta-item {
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .meta-item strong {
            color: #333;
            min-width: 100px;
          }

          .official-status {
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .official-status.official {
            background-color: #d4edda;
            color: #155724;
          }

          .official-status.unofficial {
            background-color: #f8d7da;
            color: #721c24;
          }

          .evidence-section h3 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 1.2rem;
          }

          .evidence-content {
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 1rem;
            max-height: 400px;
            overflow-y: auto;
          }

          .evidence-content pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #e0e0e0;
            background: #f8f9fa;
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
            border-radius: 0 0 8px 8px;
          }

          .modal-footer button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .copy-btn {
            background-color: #007bff;
            color: white;
          }

          .copy-btn:hover {
            background-color: #0056b3;
          }

          .takedown-btn {
            background-color: #dc3545;
            color: white;
          }

          .takedown-btn:hover {
            background-color: #c82333;
          }

          .close-footer-btn {
            background-color: #6c757d;
            color: white;
          }

          .close-footer-btn:hover {
            background-color: #545b62;
          }

          @media (max-width: 768px) {
            .modal-overlay {
              padding: 0.5rem;
            }

            .modal-header {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }

            .app-details {
              justify-content: flex-start;
            }

            .modal-footer {
              flex-direction: column;
            }

            .modal-footer button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EvidenceModal;
