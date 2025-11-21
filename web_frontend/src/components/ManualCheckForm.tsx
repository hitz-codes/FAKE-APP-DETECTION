import React, { useState } from 'react';
import { checkSingleApp, SingleAppRequest, AppData } from '../services/api';

interface ManualCheckResult {
  riskScore: number;
  evidence: string;
  appData: AppData;
}

const ManualCheckForm: React.FC = () => {
  const [formData, setFormData] = useState<SingleAppRequest>({
    app_name: '',
    package_name: '',
    publisher: '',
    brand: 'phonepe'
  });

  const [result, setResult] = useState<ManualCheckResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof SingleAppRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous results when form changes
    if (result) {
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.app_name.trim() || !formData.package_name.trim() || !formData.publisher.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await checkSingleApp(formData);
      setResult({
        riskScore: response.risk_score,
        evidence: response.evidence,
        appData: response.app_data
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze app');
    } finally {
      setLoading(false);
    }
  };

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Evidence copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  const resetForm = () => {
    setFormData({
      app_name: '',
      package_name: '',
      publisher: '',
      brand: 'phonepe'
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="manual-check-form">
      <div className="form-container">
        <h2>Manual App Analysis</h2>
        <p>Enter app details to analyze if it's a fake or suspicious financial app</p>

        <form onSubmit={handleSubmit} className="analysis-form">
          <div className="form-group">
            <label htmlFor="app_name">App Name *</label>
            <input
              id="app_name"
              type="text"
              value={formData.app_name}
              onChange={(e) => handleInputChange('app_name', e.target.value)}
              placeholder="e.g., PhonePe Pro, Paytm Lite"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="package_name">Package Name *</label>
            <input
              id="package_name"
              type="text"
              value={formData.package_name}
              onChange={(e) => handleInputChange('package_name', e.target.value)}
              placeholder="e.g., com.phonepe.pro, com.paytm.fake"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="publisher">Publisher *</label>
            <input
              id="publisher"
              type="text"
              value={formData.publisher}
              onChange={(e) => handleInputChange('publisher', e.target.value)}
              placeholder="e.g., Fake Apps Inc, Random Developer"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand">Brand *</label>
            <select
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value as any)}
              disabled={loading}
              required
            >
              <option value="phonepe">PhonePe</option>
              <option value="paytm">Paytm</option>
              <option value="gpay">GPay</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="analyze-btn"
            >
              {loading ? 'Analyzing...' : 'Analyze App'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="reset-btn"
            >
              Reset Form
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="results-container">
          <h3>Analysis Results</h3>
          
          <div className="risk-summary">
            <div className="risk-score-display">
              <div className="score-circle" style={{ 
                backgroundColor: getRiskLevelColor(result.riskScore),
                color: 'white'
              }}>
                {result.riskScore}
              </div>
              <div className="risk-details">
                <div className="risk-label">Risk Score</div>
                <div className="risk-level" style={{ color: getRiskLevelColor(result.riskScore) }}>
                  {getRiskLevelText(result.riskScore)}
                </div>
              </div>
            </div>
          </div>

          <div className="app-details">
            <h4>App Details</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Name:</strong> {result.appData.app_name}
              </div>
              <div className="detail-item">
                <strong>Package:</strong> {result.appData.package_name}
              </div>
              <div className="detail-item">
                <strong>Publisher:</strong> {result.appData.publisher}
              </div>
              <div className="detail-item">
                <strong>Brand:</strong> {result.appData.brand.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="evidence-section">
            <div className="evidence-header">
              <h4>Evidence Report</h4>
              <button
                onClick={() => copyToClipboard(result.evidence)}
                className="copy-btn"
              >
                📋 Copy Evidence
              </button>
            </div>
            <div className="evidence-content">
              <pre>{result.evidence}</pre>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .manual-check-form {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .form-container h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .form-container p {
          margin: 0 0 2rem 0;
          color: #666;
        }

        .analysis-form {
          display: grid;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f8f9fa;
          color: #666;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .analyze-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .analyze-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .reset-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .reset-btn:hover:not(:disabled) {
          background: #545b62;
        }

        .results-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .results-container h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .risk-summary {
          margin-bottom: 2rem;
        }

        .risk-score-display {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
        }

        .risk-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .risk-label {
          font-size: 0.9rem;
          color: #666;
        }

        .risk-level {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .app-details {
          margin-bottom: 2rem;
        }

        .app-details h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .evidence-section {
          margin-top: 2rem;
        }

        .evidence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .evidence-header h4 {
          margin: 0;
          color: #333;
        }

        .copy-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s ease;
        }

        .copy-btn:hover {
          background: #0056b3;
        }

        .evidence-content {
          background: #f8f9fa;
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

        @media (max-width: 768px) {
          .form-container,
          .results-container {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .analyze-btn,
          .reset-btn {
            width: 100%;
          }

          .risk-score-display {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .evidence-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .copy-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ManualCheckForm;
