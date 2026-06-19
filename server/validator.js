const fs = require('fs');
const csv = require('csv-parser');

const PHONE_RULES = {
    IN: { digits: 10, label: 'India' },
    SG: { digits: 8, label: 'Singapore' },
    US: { digits: 10, label: 'USA' },
    UK: { digits: 10, label: 'UK' },
    AE: { digits: 9, label: 'UAE' },
};

const DATE_FORMATS = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^\d{4}\/\d{2}\/\d{2}$/,
];

function isValidPhone(phone, countryCode) {
    if (!phone || phone.toString().trim() === '') return false;
    const digits = phone.toString().replace(/[\s\-\+\(\)]/g, '');
    const rule = PHONE_RULES[countryCode] || { digits: 10 };
    return /^\d+$/.test(digits) && digits.length === rule.digits;
}

function isValidDate(value) {
    if (!value || value.toString().trim() === '') return false;
    return DATE_FORMATS.some(fmt => fmt.test(value.toString().trim()));
}

function isValidEmail(value) {
    if (!value || value.toString().trim() === '') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString().trim());
}

function detectColumnType(header) {
    const h = header.toLowerCase();
    if (h.includes('phone') || h.includes('mobile') || h.includes('contact')) return 'phone';
    if (h.includes('date') || h.includes('time') || h.includes('timestamp')) return 'date';
    if (h.includes('email')) return 'email';
    if (h.includes('order_id') || h.includes('orderid')) return 'order_id';
    if (h.includes('product_id') || h.includes('productid')) return 'product_id';
    if (h.includes('amount') || h.includes('price') || h.includes('total')) return 'amount';
    if (h.includes('payment') || h.includes('mode') || h.includes('method')) return 'payment';
    return 'text';
}

function validateCSV(filePath, countryCode) {
    return new Promise((resolve, reject) => {
        const rows = [];
        const errors = [];
        let headers = [];
        let rowIndex = 0;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('headers', (hdrs) => { headers = hdrs; })
            .on('data', (row) => {
                rowIndex++;
                const rowErrors = [];
                const cleanedRow = { ...row };

                headers.forEach((header) => {
                    const type = detectColumnType(header);
                    const value = row[header];

                    if (!value || value.toString().trim() === '') {
                        if (type === 'order_id' || type === 'product_id' || type === 'phone') {
                            rowErrors.push(`Row ${rowIndex}: '${header}' is empty`);
                        }
                        return;
                    }

                    if (type === 'phone') {
                        if (!isValidPhone(value, countryCode)) {
                            rowErrors.push(`Row ${rowIndex}: Invalid phone '${value}' for country ${countryCode}`);
                            cleanedRow[header] = 'INVALID_PHONE';
                        }
                    }

                    if (type === 'date') {
                        if (!isValidDate(value)) {
                            rowErrors.push(`Row ${rowIndex}: Invalid date format '${value}' in '${header}'`);
                            cleanedRow[header] = 'INVALID_DATE';
                        }
                    }

                    if (type === 'email') {
                        if (!isValidEmail(value)) {
                            rowErrors.push(`Row ${rowIndex}: Invalid email '${value}'`);
                            cleanedRow[header] = 'INVALID_EMAIL';
                        }
                    }

                    if (type === 'amount') {
                        if (isNaN(parseFloat(value))) {
                            rowErrors.push(`Row ${rowIndex}: Non-numeric amount '${value}' in '${header}'`);
                            cleanedRow[header] = '0';
                        }
                    }

                    if (type === 'payment') {
                        const allowed = ['cash', 'card', 'upi', 'netbanking', 'wallet', 'credit', 'debit', 'online'];
                        const val = value.toString().toLowerCase().trim();
                        if (!allowed.some(a => val.includes(a))) {
                            rowErrors.push(`Row ${rowIndex}: Unrecognized payment mode '${value}'`);
                        }
                    }
                });

                if (rowErrors.length > 0) errors.push(...rowErrors);
                rows.push({ original: row, cleaned: cleanedRow, hasErrors: rowErrors.length > 0 });
            })
            .on('end', () => {
                const validRows = rows.filter(r => !r.hasErrors).map(r => r.cleaned);
                const invalidRows = rows.filter(r => r.hasErrors).length;

                const summary = {
                    totalRows: rows.length,
                    validRows: validRows.length,
                    invalidRows,
                    headers,
                    countryCode,
                    phoneRule: PHONE_RULES[countryCode] || { digits: 10, label: 'Custom' },
                };

                resolve({
                    summary,
                    errors,
                    cleanedRows: validRows,
                    totalRows: rows.length,
                    validRows: validRows.length,
                    invalidRows,
                });
            })
            .on('error', reject);
    });
}

module.exports = { validateCSV };