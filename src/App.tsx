import React, { useState } from 'react';
import { DocumentRedactor } from './services/redactor';
import './App.css';

function App() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const redactor = new DocumentRedactor();

  const handleRedact = async () => {
    setStatus('processing');
    setError('');
    
    try {
      const result = await redactor.redact();
      setResults(result);
      setStatus('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Document Redactor</h1>
        <p>Automatically redact sensitive information</p>
      </div>

      <button 
        onClick={handleRedact} 
        disabled={status === 'processing'}
        className="btn-primary"
      >
        {status === 'processing' ? 'Processing...' : 'Redact Document'}
      </button>

      {status === 'complete' && results && (
        <div className="results">
          <h3>Redaction Complete</h3>
          <p>Emails: {results.emailCount}</p>
          <p>Phones: {results.phoneCount}</p>
          <p>SSNs: {results.ssnCount}</p>
          <p>Total: {results.total}</p>
          
          {results.trackChangesEnabled && <p>✓ Track Changes enabled</p>}
          {results.headerAdded && <p>✓ Header added</p>}
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default App;