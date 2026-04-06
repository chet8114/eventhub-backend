const { Parser } = require('json2csv');

const exportToCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    return csv;
  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('Failed to export CSV');
  }
};

module.exports = { exportToCSV };
