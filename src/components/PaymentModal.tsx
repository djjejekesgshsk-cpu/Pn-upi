import React, { useState, useEffect } from 'react';
import { BankAccount, Contact, TransactionCategory } from '../types';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Building,
  ArrowRight,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface PaymentTarget {
  name: string;
  vpa: string;
  phone?: string;
  avatar?: string;
  initials?: string;
  isVerifiedMerchant?: boolean;
  category?: TransactionCategory;
  defaultAmount?: number;
  defaultNote?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: PaymentTarget | null;
  bankAccounts: BankAccount[];
  upiLiteBalance: number;
  onInitiatePin: (paymentDetails: {
    target: PaymentTarget;
    amount: number;
    note: string;
    selectedBank: BankAccount;
    useUpiLite: boolean;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  target,
  bankAccounts,
  upiLiteBalance,
  onInitiatePin,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [useUpiLite, setUseUpiLite] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen && target) {
      setAmountStr(target.defaultAmount ? target.defaultAmount.toString() : '');
      setNote(target.defaultNote || '');
      setErrorMsg('');
      const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
      if (primaryBank) setSelectedBankId(primaryBank.id);
      setUseUpiLite(false);
    }
  }, [isOpen, target, bankAccounts]);

  if (!isOpen || !target) return null;

  const numAmount = parseFloat(amountStr) || 0;
  const canUseUpiLite = numAmount > 0 && numAmount <= 500 && upiLiteBalance >= numAmount;

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];

  const handleQuickAdd = (addVal: number) => {
    sound.playKeyClick();
    const curr = parseFloat(amountStr) || 0;
    setAmountStr((curr + addVal).toString());
    setErrorMsg('');
  };

  const handleProceed = () => {
    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0');
      sound.playErrorSound();
      return;
    }

    if (numAmount > 100000) {
      setErrorMsg('Standard daily UPI transaction limit is ₹1,00,000');
      sound.playErrorSound();
      return;
    }

    if (useUpiLite) {
      if (numAmount > 500) {
        setErrorMsg('UPI Lite maximum limit per transaction is ₹500');
        sound.playErrorSound();
        return;
      }
      if (upiLiteBalance < numAmount) {
        setErrorMsg('Insufficient balance in UPI Lite wallet. Please top up or use Bank.');
        sound.playErrorSound();
        return;
      }
    } else {
      if (selectedBank && selectedBank.balance < numAmount) {
        setErrorMsg(`Insufficient balance in ${selectedBank.bankName} (₹${selectedBank.balance})`);
        sound.playErrorSound();
        return;
      }
    }

    sound.playKeyClick();
    onInitiatePin({
      target,
      amount: numAmount,
      note: note.trim() || 'Payment via UPI',
      selectedBank,
      useUpiLite,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="payment-flow-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden"
      >
        {/* Close button */}
        <button
          id="close-payment-modal-btn"
          onClick={() => {
            sound.playKeyClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Recipient Profile Card */}
        <div className="flex flex-col items-center text-center mt-2 mb-5">
          <div className="relative mb-2">
            <div className="w-16 h-16 rounded-full ring-2 ring-emerald-500/80 p-0.5 overflow-hidden bg-slate-800 shadow-md">
              {target.avatar ? (
                <img
                  src={target.avatar}
                  alt={target.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xl">
                  {target.initials || target.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 justify-center">
            Paying {target.name}
          </h3>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <span>{target.vpa}</span>
            {target.isVerifiedMerchant && (
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                Verified
              </span>
            )}
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 text-center">
            Enter Amount
          </label>
          <div className="relative flex items-center justify-center">
            <span className="text-3xl font-light text-slate-400 mr-1">₹</span>
            <input
              id="payment-amount-input"
              type="number"
              min="1"
              step="any"
              autoFocus
              placeholder="0"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                setErrorMsg('');
              }}
              className="w-48 text-center text-3xl sm:text-4xl font-bold bg-transparent border-b-2 border-slate-700 focus:border-emerald-500 focus:outline-none text-slate-100 py-1 transition-colors font-mono"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex justify-center gap-2 mt-3">
            {[100, 500, 1000, 2000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all active:scale-95 font-mono font-medium"
              >
                +₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Note / Message input */}
        <div className="mb-4">
          <input
            id="payment-note-input"
            type="text"
            placeholder="Add a note (e.g., Dinner, Groceries, Rent)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={60}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-emerald-500 focus:outline-none text-slate-200 placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Bank Selection / UPI Lite Switch */}
        <div className="mb-5 space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Payment Source
          </label>

          {/* UPI Lite Option if applicable */}
          {numAmount > 0 && numAmount <= 500 && (
            <button
              type="button"
              id="select-upi-lite-option"
              onClick={() => {
                sound.playKeyClick();
                setUseUpiLite(!useUpiLite);
              }}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                useUpiLite
                  ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50'
                  : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">UPI Lite</span>
                    <span className="text-[9px] px-1 bg-cyan-500/20 text-cyan-300 font-bold rounded">
                      PINLESS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Bal: ₹{upiLiteBalance.toLocaleString('en-IN')} • Instant 1-tap
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  useUpiLite ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                }`}
              >
                {useUpiLite && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
            </button>
          )}

          {/* Linked Bank Accounts */}
          {!useUpiLite && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {bankAccounts.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  id={`select-bank-${bank.id}`}
                  onClick={() => {
                    sound.playKeyClick();
                    setSelectedBankId(bank.id);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    selectedBankId === bank.id
                      ? 'bg-emerald-950/30 border-emerald-500/70 ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
                      {bank.bankLogo}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100">{bank.bankName}</span>
                        {bank.isPrimary && (
                          <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {bank.accountNumberMasked} • Bal: ₹{bank.balance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedBankId === bank.id
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedBankId === bank.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-shake">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Proceed Pay Button */}
        <button
          id="proceed-pay-btn"
          onClick={handleProceed}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 shadow-lg ${
            useUpiLite
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {useUpiLite ? (
            <>
              <Zap className="w-4 h-4" />
              <span>Pay ₹{numAmount > 0 ? numAmount.toLocaleString('en-IN') : '0'} with UPI Lite (1-Tap)</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Proceed to Pay ₹{numAmount > 0 ? numAmount.toLocaleString('en-IN') : '0'}</span>
            </>
          )}
        </button>

        {/* Footer Security Badge */}
        <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>NPCI 256-bit Encrypted Unified Payments Interface</span>
        </p>
      </div>
    </div>
  );
};
