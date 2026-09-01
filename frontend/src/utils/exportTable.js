/**
 * Export table data as Excel (CSV) or PDF (print).
 * No external libraries needed.
 */

export function exportToExcel(rows, columns, filename = 'export') {
  if (!rows.length) return;
  const header = columns.map((c) => `"${c.label}"`).join(',');
  const csvRows = rows.map((r) =>
    columns.map((c) => {
      const val = String(c.getValue(r) ?? '-').replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  const csv = [header, ...csvRows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(rows, columns, title = 'Report') {
  if (!rows.length) return;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #ffffff;
    color: #333333;
    margin: 40px;
    font-size: 14px;
  }

  h1 {
    font-weight: normal;
    font-size: 24px;
    color: #555555;
    margin: 0 0 20px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead tr {
    background-color: #4A90E2;
    color: #ffffff;
  }

  thead th {
    padding: 10px 12px;
    text-align: left;
    font-weight: bold;
  }

  tbody tr {
    background-color: #f2f2f2;
  }

  tbody td {
    padding: 10px 12px;
    color: #555555;
  }
</style>
</head>
<body>

  <h1>${title}</h1>

  <table>
    <thead>
      <tr>
        ${columns.map((c) => `<th>${c.label}</th>`).join('\n        ')}
      </tr>
    </thead>
    <tbody>
      ${rows.map((r) =>
    `<tr>\n        ${columns.map((c) => `<td>${c.getValue(r) ?? '-'}</td>`).join('\n        ')}\n      </tr>`
  ).join('\n      ')}
    </tbody>
  </table>

</body>
</html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
