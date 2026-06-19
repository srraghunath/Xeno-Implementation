import React, { useState } from 'react';
import Upload from './components/Upload';
import Results from './components/Results';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-x">X</span>eno
          </div>
          <div className="header-title">
            <h1>Transaction Data Validator</h1>
            <p>Upload, validate, and download clean CSV data</p>
          </div>
        </div>
      </header>

      <main className="main">
        <Upload
          setResults={setResults}
          setLoading={setLoading}
          setError={setError}
          loading={loading}
        />
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        {loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Validating your data...</p>
          </div>
        )}
        {results && !loading && (
          <Results results={results} />
        )}
      </main>

      <footer className="footer">
        <p>Built for Xeno Implementation Internship · S R Raghunath</p>
      </footer>
    </div>
  );
}

export default App;