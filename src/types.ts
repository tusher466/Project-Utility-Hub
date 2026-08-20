export type AppViewMode = 'dual' | 'counter' | 'scanner' | 'history';

export interface CounterItem {
  id: string;
  name: string;
  count: number;
  step: number;
  target?: number;
  minLimit?: number;
  maxLimit?: number;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface CounterLog {
  id: string;
  counterId: string;
  counterName: string;
  previousValue: number;
  newValue: number;
  delta: number;
  reason: 'manual_increment' | 'manual_decrement' | 'qr_scan' | 'nfc_scan' | 'manual_set' | 'reset';
  timestamp: number;
  note?: string;
}

export type ScanContentType = 'url' | 'wifi' | 'email' | 'phone' | 'sms' | 'geo' | 'text' | 'nfc_card' | 'student_id';

export interface StudentCardInfo {
  studentId: string;
  studentName: string;
  department: string;
  institution?: string;
  batch?: string;
  cardType: 'Student ID' | 'Library Pass' | 'Campus Transit' | 'Exam Hall Pass' | 'Lab Access' | 'Custom NFC';
  nfcSerialNumber: string;
  status: 'Active' | 'Verified' | 'Guest';
  issuedDate?: string;
}

export interface ScanRecord {
  id: string;
  rawText: string;
  type: ScanContentType;
  parsedDetails?: {
    url?: string;
    ssid?: string;
    password?: string;
    authType?: string;
    email?: string;
    subject?: string;
    phone?: string;
    coordinates?: string;
  };
  studentInfo?: StudentCardInfo;
  nfcDetails?: {
    serialNumber: string;
    recordsCount?: number;
    textPayload?: string;
    technology?: string;
  };
  scannedAt: number;
  source: 'camera' | 'image_upload' | 'clipboard_paste' | 'nfc_tap' | 'nfc_reader' | 'student_id_entry';
  linkedCounterId?: string;
}

// Backward compatibility alias
export type QRScanRecord = ScanRecord;
export type QRContentType = ScanContentType;

export interface AppSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoIncrementOnQR: boolean;
  autoIncrementDebounceSeconds: number;
  vibrateOnScan: boolean;
  keepScreenAwake: boolean;
  continuousScan: boolean;
  defaultStep: number;
  autoPrintOnNFCScan: boolean;
}
