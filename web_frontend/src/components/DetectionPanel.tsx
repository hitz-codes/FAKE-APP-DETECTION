import React, { useState, useEffect } from 'react';
import {
  runDetection,
  getDetectionResults,
  getSupportedBrands,
  AppData,
  Brand
} from '../services/api';
import ResultsTable from './ResultsTable';

interface DetectionPanelProps {
  selectedApp: AppData | null;
  onAppSelect: (app: AppData | null) => void;
}

const DetectionPanel: React.FC<DetectionPanelProps> = ({
  selectedApp,
  onAppSelect
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [threshold, setThreshold] = useState<number>(50);
  const [results, setResults] = useState<AppData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [totalDetected, setTotalDetected] = useState<number>(0);
  const [suspiciousCount, setSuspiciousCount] = useState<number>(0);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const brandData = await getSupportedBrands();
      setBrands(brandData);
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  const handleRunDetection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await runDetection({
        brand: selectedBrand as any,
        threshold: threshold
      });

      setResults(response.results);
      setTotalDetected(response.total_detected);
      setSuspiciousCount(response.suspicious_count);
      setSuccess(`Detection complete! Found ${response.suspiciousCount} suspicious apps out of ${response.total_detected} total apps.`);
    } catch (err: any) {
      setError(err.message || 'Failed to run detection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detection-panel">
      <div className="detection-controls">
        <div className="control-group">
          <label htmlFor="brand-select">Brand:</label>
          <select
            id="brand-select"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            disabled={loading}
          >
            {brands.map((brand) => (
              <option key={brand.value} value={brand.value}>
                {brand.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="threshold-slider">
            Risk Threshold: {threshold}
          </label>
          <input
            id="threshold-slider"
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={loading}
            className="threshold-slider"
          />
        </div>

        <div className="control-group">
          <button
            onClick={handleRunDetection}
            disabled={loading}
            className="run-detection-btn"
          >
            {loading ? 'Running Detection...' : 'Run Detection'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <strong>Success:</strong> {success}
        </div>
      )}

      {results.length > 0 && (
        <div className="detection-summary">
          <h3>Detection Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{totalDetected}</div>
              <div className="stat-label">Total Apps</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{suspiciousCount}</div>
              <div className="stat-label">Suspicious Apps</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {((suspiciousCount / totalDetected) * 100).toFixed(1)}%
              </div>
              <div className="stat-label">Suspicious Rate</div>
            </div>
          </div>
        </div>
      )}

      <ResultsTable
        results={results}
        onAppSelect={onAppSelect}
        selectedApp={selectedApp}
      />
    </div>
  );
};

export default DetectionPanel;
