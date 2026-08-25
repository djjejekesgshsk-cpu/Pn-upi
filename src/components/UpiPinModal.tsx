import React, { useState, useEffect } from 'react';
import { BankAccount } from '../types';
import { PaymentTarget } from './PaymentModal';
import {
  Shield,
  ShieldAlert,
  Delete,
  Check,
  X,
  Lock,
  Building2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface UpiPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankAccount;
  target?: PaymentTarget | null;
  amount?: number;
  mode: 'PAYMENT' | 'CHECK_BALANCE' | 'SET_PIN';
  onSuccess: () => void;
}

export const UpiPinModal: React.FC<UpiPinModalProps> = ({
  isOpen,
  onClose,
  bank,
  target,
  amount,
  mode,
  onSuccess,
}) => {
  const pinLength = bank.upiPinLength || 4;
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsProcessing(false);
      setShowHint(false);
    }
  }, [isOpen, bank]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (isProcessing) return;
    if (pin.length < pinLength) {
      sound.playKeyClick();
      setErrorMsg('');
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (isProcessing) return;
    if (pin.length > 0) {
      sound.playDeleteClick();
      setErrorMsg('');
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (isProcessing) return;
    sound.playDeleteClick();
    setPin('');
    setErrorMsg('');
  };

  const handleSubmit = () => {
    if (isProcessing) return;

    if (pin.length < pinLength) {
      sound.playErrorSound();
      setErrorMsg(`Please enter complete ${pinLength}-digit UPI PIN`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    // Simulate authentic network verification latency
    setTimeout(() => {
      // Allow correct pin or default '1234' / '123456' for ease of testing
      const isCorrect = pin === bank.correctPin || pin === '1234' || pin === '123456';

      if (isCorrect) {
        setIsProcessing(false);
        onSuccess();
      } else {
        setIsProcessing(false);
        sound.playErrorSound();
        setErrorMsg(`Incorrect UPI PIN. (Demo PIN: ${bank.correctPin})`);
        setPin('');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="npci-upi-pin-container"
        className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden"
      >
        {/* Header NPCI Branding */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              UPI
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                NPCI SECURE PIN
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {bank.bankName} ({bank.accountNumberMasked})
              </span>
            </div>
          </div>

          <button
            id="close-upi-pin-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Summary Area */}
        <div className="py-4 text-center">
          {mode === 'PAYMENT' && target && (
            <>
              <p className="text-xs text-slate-400">Paying to</p>
              <h4 className="text-sm font-bold text-slate-100 truncate">{target.name}</h4>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                ₹{amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </>
          )}

          {mode === 'CHECK_BALANCE' && (
            <>
              <p className="text-xs text-slate-400">Check Account Balance</p>
              <h4 className="text-sm font-bold text-slate-100">{bank.bankName}</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Account {bank.accountNumberMasked}
              </p>
            </>
          )}

          {/* Masked PIN Indicator Circles */}
          <div className="flex justify-center items-center gap-3 my-5">
            {Array.from({ length: pinLength }).map((_, idx) => {
              const isFilled = idx < pin.length;
              const isCurrent = idx === pin.length;

              return (
                <div
                  key={idx}
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                    isFilled
                      ? 'bg-emerald-400 border-emerald-400 scale-105 shadow-sm shadow-emerald-400/50'
                      : isCurrent
                      ? 'border-emerald-400 bg-emerald-400/20 animate-pulse ring-2 ring-emerald-400/30'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {isFilled && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
              );
            })}
          </div>

          {/* Error / Processing Status */}
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 py-1">
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Verifying with {bank.bankName}...</span>
            </div>
          ) : errorMsg ? (
            <p className="text-xs text-rose-400 font-medium py-1">{errorMsg}</p>
          ) : (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] text-slate-500 hover:text-slate-400 flex items-center justify-center gap-1 mx-auto py-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{showHint ? `Demo PIN: ${bank.correctPin}` : 'Tap for demo PIN'}</span>
            </button>
          )}
        </div>

        {/* Authentic Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`pin-key-${digit}`}
              type="button"
              disabled={isProcessing}
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-slate-950 text-lg font-bold text-slate-100 border border-slate-700/60 transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              {digit}
            </button>
          ))}

          {/* Delete / Backspace */}
          <button
            id="pin-key-backspace"
            type="button"
            disabled={isProcessing || pin.length === 0}
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all active:scale-95 flex items-center justify-center disabled:opacity-30"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Zero */}
          <button
            id="pin-key-0"
            type="button"
            disabled={isProcessing}
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 active:text-slate-950 text-lg font-bold text-slate-100 border border-slate-700/60 transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            0
          </button>

          {/* Submit Checkmark */}
          <button
            id="pin-key-submit"
            type="button"
            disabled={isProcessing || pin.length !== pinLength}
            onClick={handleSubmit}
            className={`h-12 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center shadow-md ${
              pin.length === pinLength
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-400/50 animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-40 cursor-not-allowed'
            }`}
            title="Submit PIN"
          >
            <Check className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* NPCI Security Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 leading-tight">
            <Lock className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            <span>UPI PIN is safe. It is directly validated by {bank.bankName}.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
