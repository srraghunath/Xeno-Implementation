import React, { useState } from 'react';
import Upload from './components/Upload';
import Results from './components/Results';
import './App.css';

// Stylized Xeno Logo SVG Component
export function XenoLogo({ size = 32, variant = 'blue' }) {
  const bgFill = variant === 'white' ? 'rgba(255,255,255,0.08)' : '#0066ff';
  const elementFill = variant === 'white' ? '#ffffff' : 'white';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="xeno-logo-svg">
      <rect width="100" height="100" rx="22" fill={bgFill} />
      {/* Top Left Circle */}
      <circle cx="32" cy="32" r="11" fill={elementFill} />
      {/* Bottom Right Circle */}
      <circle cx="68" cy="68" r="11" fill={elementFill} />
      {/* Connected Capsule from Bottom-Left to Top-Right */}
      <line x1="32" y1="68" x2="68" y2="32" stroke={elementFill} strokeWidth="22" strokeLinecap="round" />
    </svg>
  );
}

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-group">
            <XenoLogo size={36} />
            <div className="logo-text">
              Xeno<span className="logo-accent">.</span>
            </div>
          </div>
          <div className="header-title">
            <h1>Transaction Validator</h1>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Hero Section */}
        <section className="hero-card">
          <div className="hero-content">
            <span className="hero-tag">Retail AI Platform</span>
            <h2 className="hero-title">Transaction Data Validator</h2>
            <p className="hero-desc">
              <strong>Xeno</strong> is an AI-powered customer engagement platform purpose-built for retailers enabling them to 
              <strong> Maximise Repeat Revenue with 10x easier personalisation</strong>. Use this platform to validate, clean, and 
              automatically chunk transaction datasets (including order-level, product-level, and payment mode data) for seamless campaign importing.
            </p>
          </div>
          <div className="hero-icon-container">
            <XenoLogo size={80} variant="white" />
          </div>
        </section>

        {/* Upload Form */}
        <Upload
          setResults={setResults}
          setLoading={setLoading}
          setError={setError}
          loading={loading}
        />

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span className="error-banner-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Analyzing dataset & parsing columns...</p>
          </div>
        )}

        {/* Results Panels */}
        {results && !loading && (
          <Results results={results} />
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Xeno Customer Engagement Platform. Powered by Advanced AI Personalisation.</p>
      </footer>
    </div>
  );
}

export default App;