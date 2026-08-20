import { ScanRecord, CounterLog } from '../types';

/**
 * Escapes a field for CSV according to RFC 4180 rules
 */
function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const stringVal = String(val);
  return `"${stringVal.replace(/"/g, '""')}"`;
}

/**
 * Initiates a browser download for a generated CSV string
 */
export function downloadCSV(filename: string, csvContent: string) {
  // UTF-8 BOM so Excel opens special characters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Scan Records (QR & NFC) to CSV
 */
export function exportQRScansToCSV(records: ScanRecord[]): number {
  if (!records || records.length === 0) {
    return 0;
  }

  const headers = [
    'Record ID',
    'Timestamp (ISO)',
    'Formatted Date & Time',
    'Content Type',
    'Scan Source',
    'Decoded Payload / Student ID',
    'Student Name',
    'Department',
    'Card Type',
    'NFC Serial Number',
    'Parsed Details'
  ];

  const rows = records.map(r => {
    let parsedInfo = '';
    if (r.parsedDetails) {
      if (r.parsedDetails.url) parsedInfo = `URL: ${r.parsedDetails.url}`;
      else if (r.parsedDetails.ssid) parsedInfo = `SSID: ${r.parsedDetails.ssid}, Auth: ${r.parsedDetails.authType || 'WPA'}`;
      else if (r.parsedDetails.email) parsedInfo = `Email: ${r.parsedDetails.email}`;
      else if (r.parsedDetails.phone) parsedInfo = `Phone: ${r.parsedDetails.phone}`;
      else if (r.parsedDetails.coordinates) parsedInfo = `Coords: ${r.parsedDetails.coordinates}`;
    }

    const sourceLabel = 
      r.source === 'camera' ? 'Live Camera' :
      r.source === 'clipboard_paste' ? 'Pasted Image' :
      r.source === 'image_upload' ? 'File Upload' :
      r.source === 'nfc_tap' ? 'NFC Card Tap' :
      r.source === 'nfc_reader' ? 'Web NFC Reader' : 'Student ID Entry';

    return [
      escapeCSV(r.id),
      escapeCSV(new Date(r.scannedAt).toISOString()),
      escapeCSV(new Date(r.scannedAt).toLocaleString()),
      escapeCSV(r.type.toUpperCase()),
      escapeCSV(sourceLabel),
      escapeCSV(r.rawText),
      escapeCSV(r.studentInfo?.studentName || ''),
      escapeCSV(r.studentInfo?.department || ''),
      escapeCSV(r.studentInfo?.cardType || ''),
      escapeCSV(r.nfcDetails?.serialNumber || r.studentInfo?.nfcSerialNumber || ''),
      escapeCSV(parsedInfo)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`student_scan_records_${dateStr}.csv`, csvContent);
  return records.length;
}

/**
 * Export Counter Logs to CSV
 */
export function exportCounterLogsToCSV(logs: CounterLog[]): number {
  if (!logs || logs.length === 0) {
    return 0;
  }

  const headers = [
    'Log ID',
    'Timestamp (ISO)',
    'Formatted Date & Time',
    'Counter ID',
    'Counter Category',
    'Previous Value',
    'Delta Change',
    'New Value',
    'Action Reason',
    'Note / Context'
  ];

  const rows = logs.map(l => {
    const reasonLabel = 
      l.reason === 'qr_scan' ? 'QR Code Scan' :
      l.reason === 'nfc_scan' ? 'NFC Student Card Scan' :
      l.reason === 'manual_increment' ? 'Manual Increment (+)' :
      l.reason === 'manual_decrement' ? 'Manual Decrement (-)' :
      l.reason === 'manual_set' ? 'Direct Set Value' :
      l.reason === 'reset' ? 'Counter Reset' : l.reason;

    return [
      escapeCSV(l.id),
      escapeCSV(new Date(l.timestamp).toISOString()),
      escapeCSV(new Date(l.timestamp).toLocaleString()),
      escapeCSV(l.counterId),
      escapeCSV(l.counterName),
      escapeCSV(l.previousValue),
      escapeCSV(l.delta > 0 ? `+${l.delta}` : `${l.delta}`),
      escapeCSV(l.newValue),
      escapeCSV(reasonLabel),
      escapeCSV(l.note || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`counter_logs_${dateStr}.csv`, csvContent);
  return logs.length;
}

/**
 * Export Combined All Data (Scans + Counter Logs) into a structured CSV report
 */
export function exportAllDataToCSV(records: ScanRecord[], logs: CounterLog[]): { scanCount: number; logCount: number } {
  const dateStr = new Date().toISOString().split('T')[0];
  const generatedAt = new Date().toLocaleString();

  const lines: string[] = [
    `"=== STUDENT SCAN CORNER & UTILITY HUB DATA REPORT ==="`,
    `"Export Date: ${generatedAt}"`,
    `"Total Scan Records: ${records.length}"`,
    `"Total Counter Events: ${logs.length}"`,
    `""`,
    `"--- SECTION 1: STUDENT SCANS & QR RECORDS ---"`,
    [
      'Record ID',
      'Timestamp',
      'Content Type',
      'Source',
      'Identifier / Payload',
      'Student Name',
      'Department',
      'NFC Serial'
    ].map(h => escapeCSV(h)).join(',')
  ];

  records.forEach(r => {
    lines.push([
      escapeCSV(r.id),
      escapeCSV(new Date(r.scannedAt).toLocaleString()),
      escapeCSV(r.type.toUpperCase()),
      escapeCSV(r.source),
      escapeCSV(r.rawText),
      escapeCSV(r.studentInfo?.studentName || ''),
      escapeCSV(r.studentInfo?.department || ''),
      escapeCSV(r.nfcDetails?.serialNumber || r.studentInfo?.nfcSerialNumber || '')
    ].join(','));
  });

  lines.push(`""`);
  lines.push(`"--- SECTION 2: COUNTER AUDIT LOGS ---"`);
  lines.push([
    'Log ID',
    'Timestamp',
    'Counter Name',
    'Previous Count',
    'Delta',
    'New Count',
    'Action'
  ].map(h => escapeCSV(h)).join(','));

  logs.forEach(l => {
    lines.push([
      escapeCSV(l.id),
      escapeCSV(new Date(l.timestamp).toLocaleString()),
      escapeCSV(l.counterName),
      escapeCSV(l.previousValue),
      escapeCSV(l.delta > 0 ? `+${l.delta}` : `${l.delta}`),
      escapeCSV(l.newValue),
      escapeCSV(l.reason)
    ].join(','));
  });

  downloadCSV(`student_hub_records_and_logs_${dateStr}.csv`, lines.join('\r\n'));
  return { scanCount: records.length, logCount: logs.length };
}
