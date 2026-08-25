import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CURRENT_USER } from '../data/mockData';
import { BankAccount } from '../types';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Building,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryBank: BankAccount;
}

export const MyQrModal: React.FC<MyQrModalProps> = ({
  isOpen,
  onClose,
  primaryBank,
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate UPI URI
  const amountParam = parseFloat(customAmount) > 0 ? `&am=${parseFloat(customAmount).toFixed(2)}` : '';
  const upiUri = `upi://pay?pa=${CURRENT_USER.upiId}&pn=${encodeURIComponent(
    CURRENT_USER.name
  )}&cu=INR${amountParam}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, upiUri]);

  if (!isOpen) return null;

  const handleCopyUpiId = () => {
    sound.playKeyClick();
    navigator.clipboard.writeText(CURRENT_USER.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    sound.playKeyClick();
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `UPI-QR-${CURRENT_USER.name.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="my-qr-code-modal"
        className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              QR
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Receive Money</h3>
              <p className="text-[11px] text-slate-400">Scan using any UPI app</p>
            </div>
          </div>

          <button
            id="close-my-qr-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container with crisp white card background */}
        <div className="bg-white rounded-2xl p-4 text-slate-900 flex flex-col items-center justify-center shadow-lg relative my-2">
          {/* User Name & UPI ID above QR */}
          <div className="text-center mb-2">
            <h4 className="text-sm font-bold text-slate-900">{CURRENT_USER.name}</h4>
            <p className="text-[11px] font-mono text-slate-600">{CURRENT_USER.upiId}</p>
          </div>

          {/* Rendered QR Image */}
          {qrDataUrl ? (
            <div className="relative">
              <img
                src={qrDataUrl}
                alt="Personal UPI QR"
                className="w-52 h-52 object-contain rounded-lg"
              />
              {/* Center UPI Logo badge inside QR */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-lg shadow border border-slate-200 flex items-center justify-center font-bold text-emerald-600 text-xs">
                UPI
              </div>
            </div>
          ) : (
            <div className="w-52 h-52 bg-slate-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          )}

          {/* Amount Badge if set */}
          {parseFloat(customAmount) > 0 && (
            <div className="mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold text-xs rounded-full border border-emerald-200">
              Requesting: ₹{parseFloat(customAmount).toLocaleString('en-IN')}
            </div>
          )}

          {/* NPCI Accept all apps banner */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span>Accepts GPay • PhonePe • Paytm • BHIM</span>
          </div>
        </div>

        {/* Optional Custom Amount Input */}
        <div className="mt-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ₹
              </span>
              <input
                id="custom-qr-amount-input"
                type="number"
                placeholder="Set fixed amount (optional)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full text-xs pl-7 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {customAmount && (
              <button
                onClick={() => setCustomAmount('')}
                className="px-2.5 py-2 text-xs rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Copy UPI ID & Actions */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            id="copy-my-upi-id-btn"
            onClick={handleCopyUpiId}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy UPI ID</span>
              </>
            )}
          </button>

          <button
            id="download-my-qr-btn"
            onClick={handleDownloadQr}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Save QR Image</span>
          </button>
        </div>

        {/* Receiving Bank Footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span>Directly deposits into:</span>
            <strong className="text-slate-200 font-semibold">
              {primaryBank.bankName} ({primaryBank.accountNumberMasked})
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};
