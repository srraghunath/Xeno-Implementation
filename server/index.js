const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { validateCSV } = require('./validator');
const { chunkCSV } = require('./chunker');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

app.post('/api/validate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const countryCode = req.body.countryCode || 'IN';
        const chunkSize = parseInt(req.body.chunkSize) || 500;

        const result = await validateCSV(req.file.path, countryCode);

        const chunks = await chunkCSV(result.cleanedRows, chunkSize, req.file.originalname);

        fs.unlinkSync(req.file.path);

        res.json({
            summary: result.summary,
            errors: result.errors,
            cleanedFileName: chunks[0],
            chunks: chunks,
            totalRows: result.totalRows,
            validRows: result.validRows,
            invalidRows: result.invalidRows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Validation failed: ' + err.message });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'outputs', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.download(filePath, req.params.filename, (err) => {
        if (!err) {
            setTimeout(() => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, 5000);
        }
    });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));