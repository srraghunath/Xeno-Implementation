import React from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

function Results({ results }) {
    const { summary, errors, chunks, totalRows, validRows, invalidRows } = results;

    const handleDownload = async (filename) => {
        try {
            const res = await axios.get(`${API}/api/download/${filename}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Download failed. Please try again.');
        }
    };

    const passRate = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0;
    
    // Choose progress color based on rate
    const progressColor = passRate > 80 ? '#10b981' : passRate > 50 ? '#f59e0b' : '#ef4444';

    return (
        <div className="results-section">
            
            {/* Visual Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-card-header">
                        <span className="stat-label">Total Rows</span>
                        <div className="stat-icon">📊</div>
                    </div>
                    <div className="stat-number">{totalRows}</div>
                </div>
                
                <div className="stat-card valid">
                    <div className="stat-card-header">
                        <span className="stat-label">Valid Rows</span>
                        <div className="stat-icon">✓</div>
                    </div>
                    <div className="stat-number">{validRows}</div>
                </div>
                
                <div className="stat-card invalid">
                    <div className="stat-card-header">
                        <span className="stat-label">Invalid Rows</span>
                        <div className="stat-icon">✕</div>
                    </div>
                    <div className="stat-number">{invalidRows}</div>
                </div>
                
                <div className="stat-card rate">
                    <div className="stat-card-header">
                        <span className="stat-label">Pass Rate</span>
                        <div className="stat-icon">%</div>
                    </div>
                    <div className="stat-number">{passRate}%</div>
                </div>
            </div>

            {/* Validation Details & Progress */}
            <div className="card summary-card">
                <h2>
                    <svg className="chunk-icon-svg" style={{ color: 'var(--primary)', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Validation Summary
                </h2>
                <p className="card-sub font-body">Structural evaluation metrics and identified file columns</p>
                
                <div className="summary-grid">
                    <div className="summary-block">
                        <div className="summary-block-label">Country Code rules</div>
                        <div className="summary-block-value">
                            {summary.countryCode} — {summary.phoneRule.label} ({summary.phoneRule.digits} digits)
                        </div>
                    </div>
                    
                    <div className="summary-block">
                        <div className="summary-block-label">Detected Column Headers</div>
                        <div className="summary-block-tags">
                            {summary.headers.map((h, i) => (
                                <span key={i} className="summary-tag">{h}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="progress-bar-container">
                    <div className="progress-bar-info">
                        <span>Clean Data Integrity Score</span>
                        <span>{passRate}% Passing</span>
                    </div>
                    <div className="progress-track">
                        <div
                            className="progress-fill-bar"
                            style={{ width: `${passRate}%`, backgroundColor: progressColor }}
                        />
                    </div>
                </div>
            </div>

            {/* Clean File Downloads */}
            {chunks && chunks.length > 0 && (
                <div className="card chunks-card">
                    <h2>
                        <svg className="chunk-icon-svg" style={{ color: 'var(--success)', width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download Cleaned Chunks
                    </h2>
                    <p className="card-sub">
                        {chunks.length === 1
                            ? 'Your fully cleaned dataset has been compiled and is ready for download.'
                            : `The dataset has been split into ${chunks.length} custom chunks to ensure efficient system import.`}
                    </p>
                    
                    <div className="chunks-list">
                        {chunks.map((chunk, i) => (
                            <div key={i} className="chunk-row">
                                <div className="chunk-info">
                                    <svg className="chunk-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <span className="chunk-name">{chunk}</span>
                                </div>
                                <button
                                    className="btn-download"
                                    onClick={() => handleDownload(chunk)}
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Lists */}
            {errors && errors.length > 0 && (
                <div className="card errors-card">
                    <h2>
                        <svg className="chunk-icon-svg" style={{ color: 'var(--error)', width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Exclusion log
                        <span className="error-count">{errors.length}</span>
                    </h2>
                    <p className="card-sub">The following rows failed validation and were excluded from the export files</p>
                    
                    <div className="errors-list">
                        {errors.map((err, i) => (
                            <div key={i} className="error-row">
                                <span className="error-badge">Fail</span>
                                <span className="error-msg">{err}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Perfect Validation Success */}
            {errors && errors.length === 0 && (
                <div className="card success-card">
                    <div className="success-icon-container">
                        <svg className="success-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2>100% Integrity Score Passed</h2>
                    <p>All rows successfully validated against formats, empty checks, and payment mode configurations.</p>
                </div>
            )}

        </div>
    );
}

export default Results;