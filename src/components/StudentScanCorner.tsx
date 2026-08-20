import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Upload, 
  FlipHorizontal, 
  Zap, 
  ZapOff, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Mail, 
  Phone, 
  FileText, 
  Layers,
  RefreshCw,
  AlertCircle,
  Radio,
  CreditCard,
  QrCode,
  Sparkles,
  GraduationCap,
  Building2,
  Cpu,
  SmartphoneNfc,
  Plus,
  Eye,
  CheckCircle2,
  Activity,
  Maximize2,
  Printer,
  Settings
} from 'lucide-react';
import jsQR from 'jsqr';
import { ScanRecord, AppSettings, StudentCardInfo } from '../types';
import { parseQRContent } from '../utils/qrParser';
import { sound } from '../utils/audio';
import { StudentCardDetailsModal } from './StudentCardDetailsModal';
import { SettingsModal } from './SettingsModal';
import { printStudentNFCCard } from '../utils/printCard';
import { motion, AnimatePresence } from 'motion/react';

interface StudentScanCornerProps {
  onScanSuccess: (record: Omit<ScanRecord, 'id' | 'scannedAt'>) => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  activeCounterName: string;
  activeCount: number;
}

// Preset DIU and Campus Student Cards for quick one-tap verification
const PRESET_STUDENT_CARDS: StudentCardInfo[] = [
  {
    studentId: '253-15-466',
    studentName: 'Sabbir Ahmed',
    department: 'Dept. of Computer Science & Engineering',
    institution: 'Daffodil International University',
    batch: '59th Batch (B.Sc CSE)',
    cardType: 'Student ID',
    nfcSerialNumber: '04:A2:8E:41:7C:9B:10',
    status: 'Verified',
    issuedDate: 'Valid 2023 - 2027'
  },
  {
    studentId: '251-35-890',
    studentName: 'Nusrat Jahan',
    department: 'Dept. of Software Engineering',
    institution: 'Daffodil International University',
    batch: '57th Batch (B.Sc SWE)',
    cardType: 'Library Pass',
    nfcSerialNumber: '04:5F:19:9A:3B:48:80',
    status: 'Active',
    issuedDate: 'Valid 2022 - 2026'
  },
  {
    studentId: '252-29-114',
    studentName: 'Ayesha Rahman',
    department: 'Electrical & Electronic Engineering',
    institution: 'Daffodil International University',
    batch: '58th Batch (B.Sc EEE)',
    cardType: 'Exam Hall Pass',
    nfcSerialNumber: '04:88:CD:14:6E:20:99',
    status: 'Verified',
    issuedDate: 'Spring 2026 Exam'
  },
  {
    studentId: 'LAB-IOT-09',
    studentName: 'Tanvir Hossain (Lab Lead)',
    department: 'Robotics & IoT Innovation Lab',
    institution: 'DIU Faculty of Science & IT',
    batch: 'Research Staff',
    cardType: 'Lab Access',
    nfcSerialNumber: '04:BC:90:12:F4:55:61',
    status: 'Active',
    issuedDate: 'Restricted Keycard'
  },
  {
    studentId: 'BUS-DIU-042',
    studentName: 'Campus Transit Pass',
    department: 'Transport Division (Ashulia - Dhanmondi)',
    institution: 'DIU Smart Transit',
    batch: 'Route #4 Express',
    cardType: 'Campus Transit',
    nfcSerialNumber: '04:33:EE:62:01:DF:72',
    status: 'Verified',
    issuedDate: 'Valid 2026'
  }
];

export const StudentScanCorner: React.FC<StudentScanCornerProps> = ({
  onScanSuccess,
  settings,
  onUpdateSettings,
  activeCounterName,
  activeCount
}) => {
  const [scanMode, setScanMode] = useState<'nfc' | 'qr' | 'manual'>('nfc');

  // QR Camera refs & state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Web NFC State
  const [isNFCScanning, setIsNFCScanning] = useState<boolean>(false);
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const nfcAbortControllerRef = useRef<AbortController | null>(null);

  // Card Animation & Scanned states
  const [isTappingCard, setIsTappingCard] = useState<boolean>(false);
  const [nfcScanStatus, setNfcScanStatus] = useState<'idle' | 'scanning' | 'scanned'>('idle');
  const [scannedCardData, setScannedCardData] = useState<StudentCardInfo | null>(null);
  const [activeScanningCard, setActiveScanningCard] = useState<StudentCardInfo | null>(null);

  // Card Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [modalCardInfo, setModalCardInfo] = useState<StudentCardInfo | null>(null);
  const [modalScanRecord, setModalScanRecord] = useState<ScanRecord | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Manual Card Form state
  const [customId, setCustomId] = useState<string>('253-15-466');
  const [customName, setCustomName] = useState<string>('Sabbir Ahmed');
  const [customDept, setCustomDept] = useState<string>('Computer Science & Engineering');
  const [customBatch, setCustomBatch] = useState<string>('59th Batch');
  const [customCardType, setCustomCardType] = useState<StudentCardInfo['cardType']>('Student ID');

  // Latest decoded record
  const [latestScan, setLatestScan] = useState<ScanRecord | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const lastScannedRef = useRef<{ raw: string; timestamp: number } | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect Web NFC support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  }, []);

  // Shared scan registration helper
  const registerScanRecord = useCallback((
    rawText: string,
    type: ScanRecord['type'],
    source: ScanRecord['source'],
    extras?: {
      studentInfo?: StudentCardInfo;
      nfcDetails?: ScanRecord['nfcDetails'];
      parsedDetails?: ScanRecord['parsedDetails'];
    }
  ) => {
    const now = Date.now();
    const debounceMs = (settings.autoIncrementDebounceSeconds || 2) * 1000;

    if (
      lastScannedRef.current &&
      lastScannedRef.current.raw === rawText &&
      now - lastScannedRef.current.timestamp < debounceMs
    ) {
      // Re-trigger modal if user re-scans quickly
      if (extras?.studentInfo) {
        setModalCardInfo(extras.studentInfo);
        setIsDetailsModalOpen(true);
      }
      return;
    }

    lastScannedRef.current = { raw: rawText, timestamp: now };

    if (source === 'nfc_tap' || source === 'nfc_reader' || type === 'nfc_card') {
      if (settings.soundEnabled) sound.playNFCSuccess();
    } else {
      if (settings.soundEnabled) sound.playQRSuccess();
    }

    if (settings.vibrateOnScan || settings.hapticEnabled) {
      sound.vibrate([60, 40, 60]);
    }

    const newRecord: ScanRecord = {
      id: 'scan_' + Math.random().toString(36).substring(2, 9),
      rawText,
      type,
      scannedAt: now,
      source,
      studentInfo: extras?.studentInfo,
      nfcDetails: extras?.nfcDetails,
      parsedDetails: extras?.parsedDetails,
    };

    setLatestScan(newRecord);
    setCopied(false);

    onScanSuccess({
      rawText,
      type,
      source,
      studentInfo: extras?.studentInfo,
      nfcDetails: extras?.nfcDetails,
      parsedDetails: extras?.parsedDetails,
    });

    // Automatically pop up the Card Details Modal whenever a card is scanned!
    if (extras?.studentInfo) {
      setModalCardInfo(extras.studentInfo);
      setModalScanRecord(newRecord);
      setIsDetailsModalOpen(true);
    }

    // Automatically print card details immediately upon a successful NFC scan if configured
    const isNFC = source === 'nfc_tap' || source === 'nfc_reader' || type === 'nfc_card';
    if (isNFC && extras?.studentInfo && settings.autoPrintOnNFCScan) {
      setTimeout(() => {
        printStudentNFCCard(extras.studentInfo!, {
          scanRecord: newRecord,
          counterName: activeCounterName,
          activeCount: activeCount,
        });
      }, 300);
    }
  }, [settings, onScanSuccess, activeCounterName, activeCount]);

  // Handle NFC Card Tap with scanning animation & then display details
  const handleNFCCardTap = useCallback((card: StudentCardInfo) => {
    setIsTappingCard(true);
    setActiveScanningCard(card);
    setNfcScanStatus('scanning');

    // Trigger subtle pre-scan haptic
    if (settings.vibrateOnScan || settings.hapticEnabled) {
      sound.vibrate([40]);
    }

    // High-tech NFC reading animation duration
    setTimeout(() => {
      setScannedCardData(card);
      setNfcScanStatus('scanned');
      setIsTappingCard(false);

      registerScanRecord(
        `NFC:${card.nfcSerialNumber} // ID:${card.studentId}`,
        'nfc_card',
        'nfc_tap',
        {
          studentInfo: card,
          nfcDetails: {
            serialNumber: card.nfcSerialNumber,
            technology: 'ISO/IEC 14443-A (MIFARE DESFire / NTAG215)',
            recordsCount: 1,
            textPayload: `Student ID: ${card.studentId} | ${card.studentName} | ${card.department}`
          }
        }
      );
    }, 700);
  }, [registerScanRecord, settings]);

  const handleResetNFCReader = () => {
    setNfcScanStatus('idle');
    setScannedCardData(null);
    setActiveScanningCard(null);
  };

  // Web NFC Reader handler (Real hardware on Android Chrome / supported platforms)
  const startWebNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      setNfcError('Web NFC API is not supported on this browser/OS. You can tap the virtual cards below or enter card numbers directly.');
      return;
    }

    try {
      setNfcError(null);
      const controller = new AbortController();
      nfcAbortControllerRef.current = controller;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: controller.signal });
      setIsNFCScanning(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ndef.onreading = (event: any) => {
        const serial = event.serialNumber || '04:' + Array.from({ length: 6 }, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
        ).join(':');

        let payloadText = '';
        if (event.message && event.message.records) {
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              payloadText += textDecoder.decode(record.data);
            }
          }
        }

        const studentCard: StudentCardInfo = {
          studentId: payloadText || `253-${Math.floor(10 + Math.random() * 90)}-${Math.floor(100 + Math.random() * 900)}`,
          studentName: 'NFC Cardholder',
          department: 'Computer Science & Engineering',
          institution: 'Daffodil International University',
          cardType: 'Student ID',
          nfcSerialNumber: serial,
          status: 'Verified',
          issuedDate: 'Active 2026'
        };

        handleNFCCardTap(studentCard);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ndef.onreadingerror = () => {
        setNfcError('Cannot read data from the NFC tag. Try holding the card closer.');
      };
    } catch (err: unknown) {
      setIsNFCScanning(false);
      const error = err as Error;
      setNfcError(error.message || 'Failed to start NFC scan. Ensure NFC is enabled in device settings.');
    }
  };

  const stopWebNFCScan = () => {
    if (nfcAbortControllerRef.current) {
      nfcAbortControllerRef.current.abort();
      nfcAbortControllerRef.current = null;
    }
    setIsNFCScanning(false);
  };

  // Camera QR Code scan loop
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasTorch(false);
    setIsTorchOn(false);
  }, []);

  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && code.data.trim().length > 0) {
          const { type, parsedDetails } = parseQRContent(code.data);
          
          // Check if QR matches student format
          let studentInfo: StudentCardInfo | undefined = undefined;
          if (code.data.includes('253-') || code.data.includes('DIU') || code.data.includes('ID:')) {
            studentInfo = {
              studentId: code.data.match(/\d{3}-\d{2}-\d{3,4}/)?.[0] || code.data.substring(0, 12),
              studentName: 'QR Scanned Student',
              department: 'Campus Member',
              institution: 'Daffodil International University',
              cardType: 'Student ID',
              nfcSerialNumber: 'QR_OPTICAL_SCAN',
              status: 'Verified',
              issuedDate: new Date().toLocaleDateString()
            };
          }

          registerScanRecord(code.data, type, 'camera', { parsedDetails, studentInfo });
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
  }, [isCameraActive, registerScanRecord]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not available in this environment. Use image upload or NFC scan.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Failed to access camera';
      console.warn('Camera access error:', errorMsg);
      setCameraError('Camera access unavailable. Use NFC Tap or Image Upload.');
    }
  }, [facingMode, stopCamera, scanVideoFrame]);

  useEffect(() => {
    if (scanMode === 'qr' && isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      stopWebNFCScan();
    };
  }, [scanMode, isCameraActive, facingMode, startCamera, stopCamera]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Torch not supported on this device', err);
      }
    }
  };

  const processImageFile = useCallback((file: File | Blob) => {
    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsProcessingFile(false);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data && code.data.trim().length > 0) {
          const { type, parsedDetails } = parseQRContent(code.data);
          let studentInfo: StudentCardInfo | undefined = undefined;
          if (code.data.includes('253-') || code.data.includes('DIU') || code.data.includes('ID:')) {
            studentInfo = {
              studentId: code.data.match(/\d{3}-\d{2}-\d{3,4}/)?.[0] || code.data.substring(0, 12),
              studentName: 'QR Image Student',
              department: 'Campus Member',
              institution: 'Daffodil International University',
              cardType: 'Student ID',
              nfcSerialNumber: 'IMG_OPTICAL_SCAN',
              status: 'Verified',
              issuedDate: new Date().toLocaleDateString()
            };
          }
          registerScanRecord(code.data, type, 'image_upload', { parsedDetails, studentInfo });
        } else {
          alert('No valid QR code detected in this image.');
        }
        setIsProcessingFile(false);
      };
      img.onerror = () => {
        setIsProcessingFile(false);
        alert('Failed to load image.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [registerScanRecord]);

  const handleCustomCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim()) return;

    const pseudoNfcSerial = '04:' + Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');

    const customCard: StudentCardInfo = {
      studentId: customId.trim(),
      studentName: customName.trim() || 'Student Cardholder',
      department: customDept.trim() || 'General Studies',
      institution: 'Daffodil International University',
      batch: customBatch.trim() || undefined,
      cardType: customCardType,
      nfcSerialNumber: pseudoNfcSerial,
      status: 'Verified',
      issuedDate: new Date().toLocaleDateString()
    };

    handleNFCCardTap(customCard);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col overflow-hidden h-full">
      <canvas ref={canvasRef} className="hidden" />

      {/* Pop-up Card Details Modal */}
      <StudentCardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        cardInfo={modalCardInfo}
        scanRecord={modalScanRecord}
        activeCounterName={activeCounterName}
        activeCount={activeCount}
        autoIncremented={settings.autoIncrementOnQR}
      />

      {/* System & Scanner Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        activeCounterName={activeCounterName}
      />

      {/* Header Bar with Exact Requested Name: Student's Scan Corner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <SmartphoneNfc className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                Student's Scan Corner
              </h2>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                NFC & QR
              </span>

              {/* Real-time Listening Status Indicator with Subtle Pulse */}
              {scanMode === 'nfc' && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{isNFCScanning ? 'Listening (Web NFC)' : 'Listening for Card Tap'}</span>
                </span>
              )}

              {scanMode === 'qr' && isCameraActive && !cameraError && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                  </span>
                  <span>Listening for QR Code</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Contactless student ID card scanning, attendance check-ins & optical QR decoding
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs inside Corner */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            id="tab-scan-nfc"
            type="button"
            onClick={() => {
              setScanMode('nfc');
              setIsCameraActive(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              scanMode === 'nfc'
                ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            <span>NFC Card Tap</span>
          </button>

          <button
            id="tab-scan-qr"
            type="button"
            onClick={() => {
              setScanMode('qr');
              setIsCameraActive(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              scanMode === 'qr'
                ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>QR Camera</span>
          </button>

          <button
            id="tab-scan-manual"
            type="button"
            onClick={() => {
              setScanMode('manual');
              setIsCameraActive(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              scanMode === 'manual'
                ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Custom Card</span>
          </button>
        </div>
      </div>

      {/* Auto-Count & Auto-Print Configuration Banner */}
      <div className="px-5 sm:px-6 pt-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left: Auto Count Linkage */}
          <div className="flex items-center justify-between md:justify-start gap-3 flex-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-slate-700">
                Auto-increment counter <strong className="text-slate-900 font-semibold">{activeCounterName}</strong> (+1)
              </span>
            </div>

            <button
              id="btn-toggle-auto-increment"
              onClick={() => onUpdateSettings(prev => ({ ...prev, autoIncrementOnQR: !prev.autoIncrementOnQR }))}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoIncrementOnQR ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={settings.autoIncrementOnQR}
              title="Auto-increment counter on QR or NFC card scan"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  settings.autoIncrementOnQR ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="hidden md:block w-px h-5 bg-slate-200 shrink-0" />

          {/* Center: Auto-Print NFC Card on Scan Setting */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2">
              <Printer className={`w-4 h-4 shrink-0 ${settings.autoPrintOnNFCScan ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-slate-700 font-medium">
                Auto-Print on NFC Scan
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                settings.autoPrintOnNFCScan
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {settings.autoPrintOnNFCScan ? 'ON' : 'OFF'}
              </span>
            </div>

            <button
              id="btn-toggle-auto-print-inline"
              onClick={() => onUpdateSettings(prev => ({ ...prev, autoPrintOnNFCScan: !prev.autoPrintOnNFCScan }))}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoPrintOnNFCScan ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={settings.autoPrintOnNFCScan}
              title="Enable or disable automatic printing immediately upon successful NFC scan"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  settings.autoPrintOnNFCScan ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="hidden md:block w-px h-5 bg-slate-200 shrink-0" />

          {/* Right: Full Settings Modal Trigger */}
          <div className="flex items-center justify-end">
            <button
              id="btn-open-scan-settings"
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Open full system & scan configuration"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* ============================================================ */}
        {/* MODE 1: NFC CARD SCAN & CONTACTLESS TAP ZONE                 */}
        {/* ============================================================ */}
        {scanMode === 'nfc' && (
          <div className="flex-1 flex flex-col space-y-4">
            {/* NFC Hardware Status Banner */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center shrink-0 w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${nfcSupported ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                </div>
                <span className="text-slate-700 font-medium">
                  {nfcSupported 
                    ? 'Web NFC Hardware API Ready (Android Chrome & USB NFC Readers)' 
                    : 'Interactive Contactless Reader Active (Tap cards or hold card to screen)'}
                </span>
              </div>

              {nfcSupported && (
                <button
                  type="button"
                  onClick={isNFCScanning ? stopWebNFCScan : startWebNFCScan}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                    isNFCScanning 
                      ? 'bg-rose-600 text-white hover:bg-rose-700' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isNFCScanning && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  )}
                  <span>{isNFCScanning ? 'Stop Listening' : 'Listen for Physical Card'}</span>
                </button>
              )}
            </div>

            {nfcError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{nfcError}</span>
              </div>
            )}

            {/* Interactive Ultra-Modern NFC Smart Card Reader Terminal */}
            <div 
              id="nfc-card-reader-arena"
              className={`group relative rounded-3xl p-6 sm:p-7 transition-all duration-300 overflow-hidden cursor-pointer select-none text-white shadow-2xl border ${
                isTappingCard || nfcScanStatus === 'scanning'
                  ? 'scale-[0.985] ring-4 ring-cyan-500/50 shadow-cyan-500/30' 
                  : 'hover:shadow-2xl hover:border-cyan-500/40 hover:-translate-y-0.5'
              } bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#1e1b4b] border-slate-700/80`}
              onClick={() => {
                if (nfcScanStatus === 'scanned' && scannedCardData) {
                  // Re-open details modal or re-scan
                  setModalCardInfo(scannedCardData);
                  setIsDetailsModalOpen(true);
                } else if (nfcScanStatus === 'idle') {
                  handleNFCCardTap(PRESET_STUDENT_CARDS[0]);
                }
              }}
              title={
                nfcScanStatus === 'scanned' 
                  ? 'Click to inspect full student card details popup' 
                  : 'Click or tap to simulate physical NFC Smart Card Touch & scan'
              }
            >
              {/* Holographic Top Security Strip */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 opacity-90" />

              {/* Subtle Atmospheric Glows */}
              <div className="absolute -top-16 -right-16 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />
              <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              
              {/* Micro-Circuit Geometric Grid Background */}
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
              
              {/* Card Sheen Light Reflection */}
              <div className="absolute top-0 right-1/4 w-36 h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-12 pointer-events-none group-hover:translate-x-12 transition-transform duration-700" />

              <div className="relative z-10 min-h-[220px] sm:min-h-[240px] flex flex-col justify-between">
                
                {/* STATE 1: SCANNING IN PROGRESS ANIMATION */}
                {nfcScanStatus === 'scanning' && (
                  <div className="flex-1 flex flex-col justify-between items-center text-center py-3 relative">
                    {/* Concentric Animated Electromagnetic Wave Ripples */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 0.9 }}
                        animate={{ scale: [0.6, 1.4, 2.2], opacity: [0.9, 0.4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                        className="w-28 h-28 rounded-full border-2 border-cyan-400"
                      />
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 0.9 }}
                        animate={{ scale: [0.6, 1.4, 2.2], opacity: [0.9, 0.4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeOut', delay: 0.25 }}
                        className="w-36 h-36 rounded-full border-2 border-indigo-400"
                      />
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 0.9 }}
                        animate={{ scale: [0.6, 1.4, 2.2], opacity: [0.9, 0.4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                        className="w-44 h-44 rounded-full border border-emerald-400"
                      />
                    </div>

                    {/* Sweeping Laser Beam */}
                    <motion.div 
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: [0, 160, 0], opacity: [0.2, 0.9, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none z-20"
                    />

                    {/* Scanning Top Status */}
                    <div className="w-full flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-90" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                        </span>
                        <span className="font-mono text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                          Reading NFC Chip...
                        </span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                        13.56 MHz // 424 kbps
                      </div>
                    </div>

                    {/* Central Scanning Visual */}
                    <div className="my-auto py-2 relative z-30 flex flex-col items-center">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-2"
                      >
                        <Radio className="w-8 h-8 text-cyan-300 animate-pulse" />
                      </motion.div>
                      <div className="text-base sm:text-lg font-black text-white tracking-wide">
                        {activeScanningCard ? `Decoding ${activeScanningCard.studentName}` : 'Decrypting NFC Smart Card...'}
                      </div>
                      <div className="text-xs text-cyan-300/80 font-mono mt-1">
                        Verifying ISO/IEC 14443-A DIU Smart Pass UID
                      </div>
                    </div>

                    {/* Bottom Scanning Bar */}
                    <div className="w-full pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>KEY EXCHANGE: AES-128 AUTH</span>
                      <span className="text-cyan-400 font-semibold animate-pulse">PROCESSING DATA...</span>
                    </div>
                  </div>
                )}

                {/* STATE 2: IDLE READY STATE (NO CARD SCANNED YET) */}
                {nfcScanStatus === 'idle' && (
                  <div className="flex-1 flex flex-col justify-between py-1">
                    {/* Top Status Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/90 flex items-center justify-center text-white shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                          <GraduationCap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
                            <span>Daffodil International University</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-cyan-300">CAMPUS NFC SMART TERMINAL</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                              Ready for Scan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contactless RFID Wave Symbol Pill */}
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5 shadow-xs">
                          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>NFC 13.56MHz</span>
                        </div>
                      </div>
                    </div>

                    {/* Central Contactless Wave Target Area */}
                    <div className="my-4 py-3 flex flex-col items-center justify-center text-center relative">
                      {/* Ambient Contactless Wave Concentric Rings */}
                      <div className="relative flex items-center justify-center my-1">
                        <motion.div 
                          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute w-28 h-28 rounded-full border border-cyan-500/30 bg-cyan-500/5 pointer-events-none"
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.45, 1], opacity: [0.15, 0.4, 0.15] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                          className="absolute w-40 h-40 rounded-full border border-indigo-500/20 pointer-events-none"
                        />

                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-900 to-indigo-950 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-lg relative z-10 group-hover:scale-110 transition-transform">
                          <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </div>
                      </div>

                      <div className="text-base sm:text-lg font-black text-white mt-3 flex items-center gap-2">
                        <span>Hold or Tap Student Card Here</span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-sm mt-1">
                        Card details and verified student profile will appear immediately upon contactless scan.
                      </p>
                    </div>

                    {/* Bottom Footer Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/90 text-[11px] font-mono">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-slate-500 text-[10px] uppercase">SUPPORTED:</span>
                        <span className="text-slate-300 text-xs">MIFARE / NTAG215 / DIU ID</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-3.5 py-1.5 rounded-xl border border-indigo-400/40 flex items-center gap-1.5 transition-all shadow-xs group-hover:scale-105">
                          <Radio className="w-3.5 h-3.5 text-cyan-300" />
                          <span>TAP TO SCAN</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STATE 3: SCANNED STATE (DETAILS REVEALED AFTER SCAN) */}
                {nfcScanStatus === 'scanned' && scannedCardData && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="flex-1 flex flex-col justify-between py-1"
                  >
                    {/* Top Card Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/90 flex items-center justify-center text-white shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                          <GraduationCap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
                            <span>{scannedCardData.institution || 'Daffodil International University'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-cyan-300">CAMPUS SMART PASS</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30">
                              {scannedCardData.cardType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contactless RFID Wave Symbol Pill */}
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>VERIFIED</span>
                        </div>

                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-cyan-400/30 opacity-75" />
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative z-10 shadow-xs">
                            <Radio className="w-4 h-4 text-cyan-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center Student Highlight Info (REVEALED AFTER SCAN) */}
                    <div className="my-3 py-1 flex items-center gap-4">
                      {/* Student Monogram Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-slate-800 border-2 border-cyan-400/60 flex items-center justify-center text-white text-base font-black shadow-md shrink-0">
                        {scannedCardData.studentName
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map(n => n[0])
                          .join('')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white">
                            {scannedCardData.studentId}
                          </div>

                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                            </span>
                            <span>{scannedCardData.status}</span>
                          </span>
                        </div>

                        <div className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 flex items-center gap-2 truncate">
                          <span className="truncate">{scannedCardData.studentName}</span>
                          {scannedCardData.batch && (
                            <span className="text-xs text-slate-400 font-normal shrink-0">
                              ({scannedCardData.batch})
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-cyan-300/90 font-medium truncate mt-0.5">
                          {scannedCardData.department}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Card Footer with Security UID & Popup Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/90 text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-sans text-[10px] uppercase tracking-wider">UID:</span>
                        <span className="text-slate-300 font-semibold px-2 py-0.5 bg-slate-800/90 rounded border border-slate-700/80">
                          {scannedCardData.nfcSerialNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetNFCReader();
                          }}
                          className="text-slate-300 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                          Scan Next
                        </button>
                        <span className="text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-3 py-1.5 rounded-xl border border-indigo-400/40 flex items-center gap-1.5 transition-all shadow-xs group-hover:scale-105">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>CARD DETAILS</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Quick Student Badges List for Easy Testing */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  Tap Student Passes to Scan & Reveal Details
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Click any card badge to test scan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_STUDENT_CARDS.map((card) => {
                  const isCurrent = scannedCardData?.studentId === card.studentId;
                  const isScanning = activeScanningCard?.studentId === card.studentId && nfcScanStatus === 'scanning';
                  return (
                    <button
                      key={card.studentId}
                      type="button"
                      onClick={() => handleNFCCardTap(card)}
                      className={`p-3 text-left rounded-2xl border transition-all flex items-center justify-between group shadow-2xs ${
                        isCurrent
                          ? 'bg-slate-900 border-indigo-500/80 text-white shadow-indigo-500/10'
                          : isScanning
                          ? 'bg-cyan-950/80 border-cyan-400 text-white animate-pulse'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                          isCurrent
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : isScanning
                            ? 'bg-cyan-600 border-cyan-400 text-white'
                            : 'bg-slate-50 border-slate-200 text-indigo-700'
                        }`}>
                          {card.studentName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isCurrent || isScanning ? 'text-white' : 'text-slate-900'}`}>
                            {card.studentName}
                          </div>
                          <div className={`text-[11px] font-mono truncate ${isCurrent || isScanning ? 'text-slate-300' : 'text-slate-500'}`}>
                            <strong className={isCurrent ? 'text-indigo-300' : 'text-slate-800'}>{card.studentId}</strong> • {card.cardType}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-colors shrink-0 flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : isScanning
                          ? 'bg-cyan-500 text-slate-900 border-cyan-400 font-bold'
                          : 'bg-slate-50 text-indigo-600 border-slate-200 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}>
                        <Radio className="w-3 h-3" />
                        <span>{isCurrent ? 'Scanned' : isScanning ? 'Scanning...' : 'Tap to Scan'}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: LIVE QR CAMERA SCANNER                               */}
        {/* ============================================================ */}
        {scanMode === 'qr' && (
          <div className="flex-1 flex flex-col">
            {/* Viewfinder Window */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith('image/')) {
                    processImageFile(file);
                  }
                }
              }}
              className={`relative flex-1 min-h-[250px] sm:min-h-[290px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 transition-colors ${
                isDraggingOver ? 'border-indigo-500' : 'border-slate-800'
              }`}
            >
              {/* Radial grid overlay */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

              {isCameraActive && !cameraError ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />

                  {/* Viewfinder Reticle & Corners */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-52 h-52 sm:w-60 sm:h-60 border-2 border-indigo-400/80 rounded-lg flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br" />
                      
                      {/* Laser beam */}
                      <div className="w-full h-0.5 bg-indigo-500/80 shadow-[0_0_8px_#6366f1] animate-scan absolute left-0 right-0" />
                    </div>
                  </div>

                  {/* Live Scan Status Indicator in Viewfinder */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono backdrop-blur-xs shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-semibold tracking-wide">LISTENING FOR QR</span>
                  </div>

                  {/* Floating Camera Controls in Viewfinder */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                      className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-900 text-white border border-white/20 text-xs transition-colors"
                      title="Switch Front/Rear Camera"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          isTorchOn
                            ? 'bg-amber-500 border-amber-600 text-white'
                            : 'bg-slate-950/70 border-white/20 text-white hover:bg-slate-900'
                        }`}
                        title="Flashlight Torch"
                      >
                        {isTorchOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Monospace Telemetry HUD */}
                  <div className="absolute bottom-3 text-white text-[10px] font-mono tracking-tighter opacity-70 bg-slate-950/70 px-2.5 py-0.5 rounded border border-white/10">
                    OPTICAL 60FPS SCANNER // STUDENT CORNER
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-slate-400 flex flex-col items-center">
                  {cameraError ? (
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                  ) : (
                    <CameraOff className="w-10 h-10 text-slate-500 mb-2" />
                  )}
                  <div className="text-sm font-semibold text-white mb-1">
                    {cameraError ? 'Camera Access Required' : 'Camera Paused'}
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mb-3">
                    {cameraError || 'Activate camera feed or drop an image containing student QR codes.'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Start Camera Scan</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processImageFile(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>{isProcessingFile ? 'Decoding Image...' : 'Upload QR Image'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isCameraActive) {
                    setIsCameraActive(false);
                    stopCamera();
                  } else {
                    setIsCameraActive(true);
                    startCamera();
                  }
                }}
                className={`p-2.5 border rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                  isCameraActive 
                    ? 'bg-slate-100 border-slate-300 text-slate-700' 
                    : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{isCameraActive ? 'Pause Camera' : 'Live Camera'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 3: CUSTOM CARD & MANUAL STUDENT ID ENTRY               */}
        {/* ============================================================ */}
        {scanMode === 'manual' && (
          <form onSubmit={handleCustomCardSubmit} className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Simulate any custom student ID, campus smartcard, or barcode gun scan input with instant Card Details Popup and counter log.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID / Card Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 253-15-466"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sabbir Ahmed"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Program
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE / SWE / EEE"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Batch / Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 59th Batch"
                    value={customBatch}
                    onChange={(e) => setCustomBatch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Card Type
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['Student ID', 'Library Pass', 'Campus Transit', 'Exam Hall Pass', 'Lab Access', 'Custom NFC'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCustomCardType(type)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        customCardType === type
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-4 h-4" />
              <span>Tap & Popup Custom Card Details</span>
            </button>
          </form>
        )}

        {/* Latest Scanned Student / QR Record Box with Popup Trigger */}
        {latestScan && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  {latestScan.type === 'nfc_card' ? (
                    <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  ) : latestScan.type === 'url' ? (
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  ) : latestScan.type === 'wifi' ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  ) : latestScan.type === 'email' ? (
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                  ) : latestScan.type === 'phone' ? (
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {latestScan.studentInfo ? `Student Pass: ${latestScan.studentInfo.cardType}` : `Decoded ${latestScan.type.toUpperCase()}`}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(latestScan.scannedAt).toLocaleTimeString()}
                </span>
              </div>

              {settings.autoIncrementOnQR && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> +1 ({activeCounterName}: {activeCount})
                </span>
              )}
            </div>

            {/* Student Info preview if available */}
            {latestScan.studentInfo ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {latestScan.studentInfo.studentName}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {latestScan.studentInfo.status}
                  </span>
                </div>
                <div className="text-slate-600">
                  ID: <strong className="font-mono text-slate-900">{latestScan.studentInfo.studentId}</strong> • {latestScan.studentInfo.department}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  NFC UID: {latestScan.studentInfo.nfcSerialNumber}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 break-all select-all mb-3 max-h-24 overflow-y-auto">
                {latestScan.rawText}
              </div>
            )}

            {/* Action buttons including Re-open Card Details Popup & Print */}
            <div className="flex flex-wrap items-center gap-2">
              {latestScan.studentInfo && (
                <>
                  <button
                    id="btn-latest-scan-print-card"
                    type="button"
                    onClick={() => {
                      if (latestScan.studentInfo) {
                        if (settings.soundEnabled) sound.playClick();
                        printStudentNFCCard(latestScan.studentInfo, {
                          scanRecord: latestScan,
                          counterName: activeCounterName,
                          activeCount: activeCount,
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                    title="Print Student NFC Smart Card"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Print Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalCardInfo(latestScan.studentInfo || null);
                      setModalScanRecord(latestScan);
                      setIsDetailsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleCopy(latestScan.studentInfo?.studentId || latestScan.rawText)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>

              {latestScan.type === 'url' && (
                <a
                  href={latestScan.parsedDetails?.url || latestScan.rawText}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
