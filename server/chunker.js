const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

function chunkCSV(rows, chunkSize, originalName) {
    return new Promise((resolve, reject) => {
        try {
            if (!rows || rows.length === 0) {
                resolve([]);
                return;
            }

            const baseName = path.basename(originalName, path.extname(originalName));
            const chunks = [];
            const outputDir = path.join(__dirname, 'outputs');

            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            const totalChunks = Math.ceil(rows.length / chunkSize);

            for (let i = 0; i < totalChunks; i++) {
                const chunkRows = rows.slice(i * chunkSize, (i + 1) * chunkSize);
                const parser = new Parser({ fields: Object.keys(rows[0]) });
                const csv = parser.parse(chunkRows);

                const fileName = totalChunks === 1
                    ? `${baseName}_cleaned.csv`
                    : `${baseName}_part${i + 1}_of_${totalChunks}.csv`;

                const filePath = path.join(outputDir, fileName);
                fs.writeFileSync(filePath, csv);
                chunks.push(fileName);
            }

            resolve(chunks);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { chunkCSV };