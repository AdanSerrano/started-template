export function getPageStyles(pageSize: string, orientation: string): string {
  return `
    @page {
      size: ${pageSize} ${orientation};
      margin: 1.5cm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `
}

export const TABLE_STYLES = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: #1a1a1a;
    background: white;
  }

  .print-container {
    padding: 20px;
    max-width: 100%;
  }

  .print-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e5e7eb;
  }

  .print-title {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 5px;
  }

  .print-meta {
    font-size: 11px;
    color: #6b7280;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .print-table th {
    background-color: #f3f4f6;
    font-weight: 600;
    text-align: left;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    color: #374151;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .print-table td {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    vertical-align: top;
  }

  .print-table tr:nth-child(even) {
    background-color: #f9fafb;
  }

  .print-table tr:hover {
    background-color: #f3f4f6;
  }

  .print-footer {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #9ca3af;
    text-align: center;
  }

  .print-summary {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 11px;
    color: #6b7280;
  }
`

// Utility function to escape HTML and prevent XSS
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char)
}
