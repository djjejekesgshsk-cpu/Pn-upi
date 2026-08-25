import React, { useState, useRef, useEffect } from 'react';
import { DEMO_QR_CODES } from '../data/mockData';
import { PaymentTarget } from './PaymentModal';
import {
  X,
  Camera,
  Upload,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (target: PaymentTarget) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      // Try initializing camera
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
            setCameraError('');
          }
        })
        .catch((err) => {
          setCameraActive(false);
          setCameraError('Camera access not active. You can upload an image or tap demo QR below.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectDemoQr = (demo: typeof DEMO_QR_CODES[0]) => {
    sound.playKeyClick();
    onScanSuccess({
      name: demo.name,
      vpa: demo.vpa,
      defaultAmount: demo.amount,
      defaultNote: demo.note,
      isVerifiedMerchant: true,
      category: demo.category as any,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playKeyClick();
    // Simulate smart QR decoding from image
    setTimeout(() => {
      onScanSuccess({
        name: 'Supermarket Express',
        vpa: 'supermarket.pos@icici',
        defaultAmount: 380,
        defaultNote: 'Scan & Pay Invoice',
        isVerifiedMerchant: true,
        category: 'GROCERY',
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="qr-scanner-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Scan any UPI QR Code</h3>
              <p className="text-[11px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM</p>
            </div>
          </div>

          <button
            id="close-qr-scanner-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative aspect-square max-h-64 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center mb-4">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500 mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-300">Live Camera Scanner</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[220px] mx-auto">
                {cameraError || 'Align any merchant QR code within the frame to pay'}
              </p>
            </div>
          )}

          {/* Laser Scanner animation overlay */}
          <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none">
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400" />

            {/* Scanning Line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-scanLine" />
          </div>
        </div>

        {/* Upload from Gallery button */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            id="upload-qr-image-btn"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Upload QR Image from Gallery</span>
          </button>
        </div>

        {/* Preset Instant Demo QR Codes (for effortless testing) */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Or Tap Quick Demo QR to Test
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_QR_CODES.map((demo, idx) => (
              <button
                key={idx}
                id={`demo-qr-btn-${idx}`}
                onClick={() => handleSelectDemoQr(demo)}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-emerald-950/40 border border-slate-700/70 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                    {demo.name}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    ₹{demo.amount}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{demo.note}</p>
                <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 mt-1 font-medium">
                  {demo.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
