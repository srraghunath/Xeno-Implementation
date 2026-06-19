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

    return (
        <div className="results-section">

            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-number">{totalRows}</div>
                    <div className="stat-label">Total Rows</div>
                </div>
                <div className="stat-card valid">
                    <div className="stat-number">{validRows}</div>
                    <div className="stat-label">Valid Rows</div>
                </div>
                <div className="stat-card invalid">
                    <div className="stat-number">{invalidRows}</div>
                    <div className="stat-label">Invalid Rows</div>
                </div>
                <div className="stat-card rate">
                    <div className="stat-number">{passRate}%</div>
                    <div className="stat-label">Pass Rate</div>
                </div>
            </div>

            <div className="card">
                <h2>Validation Summary</h2>
                <div className="summary-row">
                    <span>Country Code</span>
                    <strong>{summary.countryCode} — {summary.phoneRule.label} ({summary.phoneRule.digits} digits)</strong>
                </div>
                <div className="summary-row">
                    <span>Columns Detected</span>
                    <strong>{summary.headers.join(', ')}</strong>
                </div>
                <div className="progress-bar-wrap">
                    <div className="progress-bar-label">
                        <span>Pass Rate</span>
                        <span>{passRate}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${passRate}%`, background: passRate > 80 ? '#22c55e' : passRate > 50 ? '#f59e0b' : '#ef4444' }}
                        />
                    </div>
                </div>
            </div>

            {chunks && chunks.length > 0 && (
                <div className="card">
                    <h2>Download Cleaned Files</h2>
                    <p className="card-sub">
                        {chunks.length === 1
                            ? 'Your cleaned file is ready for download.'
                            : `Large file split into ${chunks.length} chunks for easier handling.`}
                    </p>
                    <div className="chunks-list">
                        {chunks.map((chunk, i) => (
                            <div key={i} className="chunk-row">
                                <div className="chunk-info">
                                    <span className="chunk-icon">📄</span>
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

            {errors && errors.length > 0 && (
                <div className="card errors-card">
                    <h2>Validation Errors <span className="error-count">{errors.length}</span></h2>
                    <p className="card-sub">These rows had issues and were excluded from the cleaned file.</p>
                    <div className="errors-list">
                        {errors.slice(0, 100).map((err, i) => (
                            <div key={i} className="error-row">
                                <span className="error-dot">●</span>
                                <span>{err}</span>
                            </div>
                        ))}
                        {errors.length > 100 && (
                            <div className="error-row muted">
                                ...and {errors.length - 100} more errors. Download the file to see all.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {errors && errors.length === 0 && (
                <div className="card success-card">
                    <span className="success-icon">✓</span>
                    <h2>All rows passed validation!</h2>
                    <p>No errors found in your dataset.</p>
                </div>
            )}

        </div>
    );
}

export default Results;