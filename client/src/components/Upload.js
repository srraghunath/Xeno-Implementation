import React, { useState } from 'react';
import axios from 'axios';

const COUNTRY_CODES = [
    { code: 'IN', label: 'India (10 digits)' },
    { code: 'SG', label: 'Singapore (8 digits)' },
    { code: 'US', label: 'USA (10 digits)' },
    { code: 'UK', label: 'UK (10 digits)' },
    { code: 'AE', label: 'UAE (9 digits)' },
];

const API = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

function Upload({ setResults, setLoading, setError, loading }) {
    const [file, setFile] = useState(null);
    const [countryCode, setCountryCode] = useState('IN');
    const [chunkSize, setChunkSize] = useState(500);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (f) => {
        if (f && f.name.endsWith('.csv')) {
            setFile(f);
            setError(null);
        } else {
            setError('Please upload a valid CSV file.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        handleFile(f);
    };

    const handleSubmit = async () => {
        if (!file) return setError('Please select a CSV file first.');
        setLoading(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('countryCode', countryCode);
        formData.append('chunkSize', chunkSize);

        try {
            const res = await axios.post(`${API}/api/validate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResults(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card upload-card">
            <h2>
                <svg className="chunk-icon-svg" style={{ color: 'var(--primary)', width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                </svg>
                Upload Transaction Dataset
            </h2>
            <p className="card-sub">Drag and drop order, product, and payment CSV data sheets to initiate live validation</p>

            <div
                className={`dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                    <div className="file-selected">
                        <div className="file-icon">
                            <svg width="48" height="48" fill="none" stroke="var(--success)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                ) : (
                    <div className="dropzone-placeholder">
                        <div className="upload-icon">
                            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                        </div>
                        <p>Drag & drop your CSV here or <span className="link">browse files</span></p>
                        <p className="small">Only standard .csv file types are accepted</p>
                    </div>
                )}
            </div>

            <div className="options-row">
                <div className="option-group">
                    <label>Country (For Phone Length Rules)</label>
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                        {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <div className="option-group">
                    <label>Splitting Chunk Size (rows per file)</label>
                    <input
                        type="number"
                        min="100"
                        max="10000"
                        value={chunkSize}
                        onChange={(e) => setChunkSize(parseInt(e.target.value) || 500)}
                    />
                </div>
            </div>

            <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !file}
            >
                {loading ? 'Processing Dataset...' : 'Validate & Export Clean Chunks'}
            </button>
        </div>
    );
}

export default Upload;