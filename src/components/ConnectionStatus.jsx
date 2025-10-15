import { useState, useEffect } from 'react';
import { apiHealth } from '../services/api';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const health = await apiHealth.checkConnection();
      
      if (health.status === 'connected') {
        setStatus('connected');
        setDetails(health.data);
      } else {
        setStatus('disconnected');
        setDetails({ error: health.error });
      }
    } catch (error) {
      setStatus('error');
      setDetails({ error: error.message });
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#10b981';
      case 'disconnected':
        return '#ef4444';
      case 'checking':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return 'fas fa-check-circle';
      case 'disconnected':
        return 'fas fa-times-circle';
      case 'checking':
        return 'fas fa-circle-notch fa-spin';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected to Server';
      case 'disconnected':
        return 'Server Disconnected';
      case 'checking':
        return 'Checking Connection...';
      default:
        return 'Unknown Status';
    }
  };

  // Only show in development mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="connection-status">
      <button
        className="status-indicator"
        onClick={() => setShowDetails(!showDetails)}
        style={{ background: getStatusColor() }}
        title={getStatusText()}
      >
        <i className={getStatusIcon()}></i>
      </button>

      {showDetails && (
        <div className="status-details card">
          <div className="status-header">
            <h4>Server Connection</h4>
            <button onClick={() => setShowDetails(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="status-body">
            <div className="status-row">
              <span>Status:</span>
              <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
                {getStatusText()}
              </span>
            </div>

            {details?.mongodb && (
              <div className="status-row">
                <span>Database:</span>
                <span style={{ color: details.mongodb === 'connected' ? '#10b981' : '#ef4444' }}>
                  {details.mongodb}
                </span>
              </div>
            )}

            {details?.uptime && (
              <div className="status-row">
                <span>Uptime:</span>
                <span>{Math.floor(details.uptime)}s</span>
              </div>
            )}

            {details?.error && (
              <div className="status-error">
                <strong>Error:</strong>
                <p>{details.error}</p>
              </div>
            )}

            <button className="btn btn-primary btn-sm" onClick={checkConnection}>
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

