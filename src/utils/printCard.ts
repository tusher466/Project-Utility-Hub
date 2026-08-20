import { StudentCardInfo, ScanRecord } from '../types';

export interface PrintCardOptions {
  format?: 'badge_duo' | 'single_badge' | 'full_slip';
  scanRecord?: ScanRecord | null;
  counterName?: string;
  activeCount?: number;
  onSuccess?: () => void;
}

/**
 * Generates and triggers a print job for a student NFC smart card.
 * Uses a direct isolated DOM container pattern and fallback iframe
 * to guarantee compatibility in all browsers, iframes, and mobile devices.
 */
export function printStudentNFCCard(card: StudentCardInfo, options: PrintCardOptions = {}): void {
  const {
    scanRecord,
    counterName = 'Attendance Counter',
    activeCount,
    onSuccess,
  } = options;

  const scanTimestamp = scanRecord 
    ? new Date(scanRecord.scannedAt).toLocaleString() 
    : new Date().toLocaleString();

  // Initials for avatar
  const initials = card.studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('') || 'DIU';

  const containerId = 'nfc-print-container';
  
  // Clean up any previous print container
  const existing = document.getElementById(containerId);
  if (existing) {
    existing.remove();
  }

  // Create isolated container
  const printContainer = document.createElement('div');
  printContainer.id = containerId;

  printContainer.innerHTML = `
    <style>
      .print-doc {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #ffffff;
        color: #0f172a;
        padding: 16px;
        box-sizing: border-box;
      }
      .print-doc * {
        box-sizing: border-box;
      }
      .print-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 12px;
        margin-bottom: 20px;
        border-bottom: 2px solid #0f172a;
      }
      .print-title {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.5px;
      }
      .print-meta {
        font-size: 11px;
        color: #475569;
        text-align: right;
        font-family: monospace;
      }
      .cut-guide {
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        margin-bottom: 14px;
        font-family: monospace;
        letter-spacing: 0.5px;
      }
      .cards-container {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        justify-content: flex-start;
        margin-bottom: 24px;
      }
      .id-card {
        width: 324px;
        height: 204px;
        border-radius: 14px;
        position: relative;
        overflow: hidden;
        border: 1.5px solid #0f172a;
        background: #090d16;
        color: #ffffff;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .card-strip {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: #4f46e5;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .uni-title {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: #f8fafc;
      }
      .pass-type {
        font-size: 8.5px;
        color: #38bdf8;
        font-weight: 700;
      }
      .nfc-badge {
        font-family: monospace;
        font-size: 8px;
        font-weight: 700;
        padding: 2px 6px;
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 6px;
        color: #22d3ee;
      }
      .card-body {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 4px 0;
      }
      .card-avatar {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        background: #0284c7;
        border: 1.5px solid #38bdf8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        flex-shrink: 0;
      }
      .card-student-name {
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
      }
      .card-student-dept {
        font-size: 9.5px;
        color: #7dd3fc;
        margin-top: 2px;
        font-weight: 600;
      }
      .status-pill {
        font-size: 7.5px;
        font-weight: 700;
        padding: 1px 5px;
        background: #065f46;
        border: 1px solid #10b981;
        border-radius: 4px;
        color: #6ee7b7;
        text-transform: uppercase;
        display: inline-block;
        margin-top: 3px;
      }
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-top: 6px;
        border-top: 1px solid rgba(148, 163, 184, 0.3);
      }
      .id-label {
        font-size: 7.5px;
        color: #94a3b8;
        font-family: monospace;
        text-transform: uppercase;
      }
      .id-value {
        font-family: monospace;
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
      }
      .uid-value {
        font-family: monospace;
        font-size: 8.5px;
        color: #e2e8f0;
      }
      .card-back {
        background: #0f172a;
        border: 1.5px solid #334155;
      }
      .mag-stripe {
        position: absolute;
        top: 20px;
        left: 0;
        right: 0;
        height: 32px;
        background: #020617;
      }
      .back-content {
        margin-top: 48px;
        font-size: 7.5px;
        line-height: 1.4;
        color: #94a3b8;
      }
      .back-signature-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 8px;
      }
      .sig-box {
        width: 130px;
        height: 22px;
        background: #ffffff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        font-family: monospace;
        font-size: 8px;
        color: #0f172a;
        font-weight: 700;
      }
      .barcode-svg {
        height: 22px;
        width: 100px;
        filter: invert(1);
      }
      .slip-section {
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        padding: 16px 18px;
        margin-top: 10px;
      }
      .slip-title {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .slip-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        font-size: 11px;
      }
      .slip-row {
        padding: 8px 10px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .slip-label {
        font-size: 9px;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 2px;
      }
      .slip-value {
        font-weight: 800;
        color: #0f172a;
        font-family: monospace;
      }
      .official-seal {
        margin-top: 14px;
        padding-top: 10px;
        border-top: 1px dashed #94a3b8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9.5px;
        color: #475569;
      }
    </style>

    <div class="print-doc">
      <div class="print-header">
        <div>
          <div class="print-title">Daffodil International University</div>
          <div style="font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px;">
            Student NFC Smart Pass & Attendance Verification Certificate
          </div>
        </div>
        <div class="print-meta">
          <div>PRINT DATE: ${new Date().toLocaleDateString()}</div>
          <div>UID: ${card.nfcSerialNumber}</div>
        </div>
      </div>

      <div class="cut-guide">✂ CUT ALONG THE BORDERS FOR STANDARD CR80 ID BADGE HOLDER</div>

      <div class="cards-container">
        <!-- FRONT OF CARD -->
        <div class="id-card">
          <div class="card-strip"></div>
          
          <div class="card-header">
            <div>
              <div class="uni-title">${card.institution || 'Daffodil International University'}</div>
              <div class="pass-type">CAMPUS SMART PASS • ${card.cardType}</div>
            </div>
            <div class="nfc-badge">
              ● NFC 13.56MHz
            </div>
          </div>

          <div class="card-body">
            <div class="card-avatar">
              ${initials}
            </div>
            <div style="min-width: 0;">
              <div class="card-student-name">${card.studentName}</div>
              <div class="card-student-dept">${card.department}</div>
              <div>
                <span class="status-pill">● ${card.status || 'VERIFIED'}</span>
                ${card.batch ? `<span style="font-size: 7.5px; padding: 1px 5px; background: #1e293b; border-radius: 4px; color: #cbd5e1; margin-left: 4px; font-family: monospace;">${card.batch}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div>
              <div class="id-label">STUDENT ID</div>
              <div class="id-value">${card.studentId}</div>
            </div>
            <div style="text-align: right;">
              <div class="id-label">CHIP SERIAL</div>
              <div class="uid-value">${card.nfcSerialNumber}</div>
            </div>
          </div>
        </div>

        <!-- BACK OF CARD -->
        <div class="id-card card-back">
          <div class="mag-stripe"></div>

          <div class="back-content">
            <p><strong>CAMPUS PASS TERMS:</strong> This NFC Smart Card is property of Daffodil International University. Holder is authorized for automated attendance logging, library checkout, lab entry, and campus transit.</p>
            <p style="margin-top: 3px;"><strong>EMERGENCY:</strong> +880 2 224441833 | info@daffodilvarsity.edu.bd</p>
          </div>

          <div class="back-signature-row">
            <div>
              <div style="font-size: 7px; color: #94a3b8; margin-bottom: 2px;">AUTHORIZED SIGNATURE</div>
              <div class="sig-box">
                <span>DIU REGISTRAR</span>
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 7px; color: #94a3b8; margin-bottom: 2px;">ISO 14443-A BARCODE</div>
              <svg class="barcode-svg" viewBox="0 0 100 22" preserveAspectRatio="none">
                <rect x="0" y="0" width="3" height="22" fill="#fff"/>
                <rect x="5" y="0" width="2" height="22" fill="#fff"/>
                <rect x="9" y="0" width="4" height="22" fill="#fff"/>
                <rect x="15" y="0" width="1" height="22" fill="#fff"/>
                <rect x="18" y="0" width="3" height="22" fill="#fff"/>
                <rect x="23" y="0" width="5" height="22" fill="#fff"/>
                <rect x="30" y="0" width="2" height="22" fill="#fff"/>
                <rect x="34" y="0" width="3" height="22" fill="#fff"/>
                <rect x="39" y="0" width="1" height="22" fill="#fff"/>
                <rect x="42" y="0" width="4" height="22" fill="#fff"/>
                <rect x="48" y="0" width="2" height="22" fill="#fff"/>
                <rect x="52" y="0" width="5" height="22" fill="#fff"/>
                <rect x="59" y="0" width="1" height="22" fill="#fff"/>
                <rect x="62" y="0" width="3" height="22" fill="#fff"/>
                <rect x="67" y="0" width="4" height="22" fill="#fff"/>
                <rect x="73" y="0" width="2" height="22" fill="#fff"/>
                <rect x="77" y="0" width="3" height="22" fill="#fff"/>
                <rect x="82" y="0" width="5" height="22" fill="#fff"/>
                <rect x="89" y="0" width="2" height="22" fill="#fff"/>
                <rect x="93" y="0" width="4" height="22" fill="#fff"/>
                <rect x="98" y="0" width="2" height="22" fill="#fff"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- VERIFICATION SLIP SECTION -->
      <div class="slip-section">
        <div class="slip-title">
          <span>Official Student NFC Scan Log & Record</span>
          <span style="font-size: 11px; color: #059669; font-weight: 700;">● SECURE NFC CHIP VERIFIED</span>
        </div>

        <div class="slip-grid">
          <div class="slip-row">
            <div class="slip-label">Student Name</div>
            <div class="slip-value" style="font-family: inherit; font-size: 12px;">${card.studentName}</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">Student ID Number</div>
            <div class="slip-value">${card.studentId}</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">Department & Program</div>
            <div class="slip-value" style="font-family: inherit;">${card.department}</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">Academic Batch / Session</div>
            <div class="slip-value">${card.batch || 'Spring 2026'}</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">NFC Chip UID (Hardware Serial)</div>
            <div class="slip-value">${card.nfcSerialNumber}</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">NFC Standard / Technology</div>
            <div class="slip-value">ISO/IEC 14443-A (MIFARE / NTAG215)</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">Scan / Verification Timestamp</div>
            <div class="slip-value">${scanTimestamp}</div>
          </div>
          <div class="slip-row">
            <div class="slip-label">Linked Counter Status</div>
            <div class="slip-value">${counterName} ${activeCount !== undefined ? `(Tally: ${activeCount})` : ''}</div>
          </div>
        </div>

        <div class="official-seal">
          <div>
            <strong>Issued by:</strong> DIU Smart Attendance & Digital Services Office
          </div>
          <div>
            <strong>System Verification Code:</strong> DIU-NFC-${card.studentId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(printContainer);

  if (onSuccess) {
    onSuccess();
  }

  // Trigger print with slight delay for DOM mount & font layout
  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print failed, trying iframe print fallback:', err);
      // Fallback to iframe if needed
      try {
        const fallbackFrame = document.createElement('iframe');
        fallbackFrame.style.display = 'none';
        document.body.appendChild(fallbackFrame);
        fallbackFrame.contentDocument?.write(`<html><head><title>Print Card</title></head><body>${printContainer.innerHTML}</body></html>`);
        fallbackFrame.contentDocument?.close();
        fallbackFrame.contentWindow?.focus();
        fallbackFrame.contentWindow?.print();
        setTimeout(() => fallbackFrame.remove(), 2000);
      } catch (innerErr) {
        console.error('All print strategies failed:', innerErr);
      }
    } finally {
      // Clean up injected print container after print dialog finishes
      const cleanup = () => {
        if (document.body.contains(printContainer)) {
          printContainer.remove();
        }
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      setTimeout(cleanup, 4000);
    }
  }, 100);
}
