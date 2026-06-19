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
            <h2>Upload CSV File</h2>
            <p className="card-sub">Supports order-level, product-level, and payment mode data</p>

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
                        <span className="file-icon">📄</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                ) : (
                    <div className="dropzone-placeholder">
                        <span className="upload-icon">⬆</span>
                        <p>Drag & drop your CSV here or <span className="link">browse</span></p>
                        <p className="small">Only .csv files are accepted</p>
                    </div>
                )}
            </div>

            <div className="options-row">
                <div className="option-group">
                    <label>Country Code (Phone Validation)</label>
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                        {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                    </select>
                </div>

                <div className="option-group">
                    <label>Chunk Size (rows per file)</label>
                    <input
                        type="number"
                        min="100"
                        max="10000"
                        value={chunkSize}
                        onChange={(e) => setChunkSize(e.target.value)}
                    />
                </div>
            </div>

            <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !file}
            >
                {loading ? 'Validating...' : 'Validate & Process'}
            </button>
        </div>
    );
}

export default Upload;