import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Transaction, Reward } from '../types';
import {
  CheckCircle2,
  Share2,
  Download,
  Gift,
  Split,
  ArrowRight,
  ShieldCheck,
  Building,
  Copy,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onOpenScratchCard?: (rewardId: string) => void;
  onSplitBill?: (transaction: Transaction) => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenScratchCard,
  onSplitBill,
}) => {
  const [copiedUtr, setCopiedUtr] = React.useState<boolean>(false);

  useEffect(() => {
    if (isOpen && transaction) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#3B82F6', '#F59E0B', '#EC4899'],
        });
      } catch {}

      // Play success chime & voice announcement
      sound.playPaymentSuccessChime();
      sound.announceSoundbox(transaction.amount);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const handleCopyUtr = () => {
    navigator.clipboard.writeText(transaction.utr);
    setCopiedUtr(true);
    sound.playKeyClick();
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const formattedDate = new Date(transaction.timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div
        id="payment-success-card"
        className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative overflow-hidden"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Big Success Icon Animation */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Payment Successful
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 font-mono mt-1">
            ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Paid to <strong className="text-slate-200">{transaction.title}</strong>
          </p>
          <p className="text-[11px] text-slate-500 font-mono">{transaction.recipientVpa}</p>
        </div>

        {/* Scratch Card Unlock Banner (if rewarded) */}
        {transaction.scratchCardEarned && transaction.scratchCardId && (
          <div
            id="reward-earned-banner"
            onClick={() => {
              sound.playKeyClick();
              if (onOpenScratchCard && transaction.scratchCardId) {
                onOpenScratchCard(transaction.scratchCardId);
              }
            }}
            className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  You Won a Scratch Card! ✨
                </span>
                <p className="text-[10px] text-amber-300/80">Tap to reveal mystery cashback or coupon</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {/* Transaction Details Box */}
        <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/80 space-y-2 text-xs mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">UPI Ref / UTR No</span>
            <button
              onClick={handleCopyUtr}
              className="flex items-center gap-1 text-slate-200 hover:text-emerald-400 font-mono font-medium transition-colors"
              title="Copy 12-digit UTR"
            >
              <span>{transaction.utr}</span>
              {copiedUtr ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Payment Mode</span>
            <span className="text-slate-200 font-medium">{transaction.bankUsed}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Time</span>
            <span className="text-slate-200">{formattedDate}</span>
          </div>

          {transaction.note && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span className="text-slate-400">Note</span>
              <span className="text-slate-300 italic truncate max-w-[200px]">{transaction.note}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Split / Share / Done */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {onSplitBill && (
            <button
              id="split-this-bill-btn"
              onClick={() => {
                sound.playKeyClick();
                onSplitBill(transaction);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Split className="w-4 h-4 text-pink-400" />
              <span>Split Expense</span>
            </button>
          )}

          <button
            id="share-receipt-btn"
            onClick={() => {
              sound.playKeyClick();
              if (navigator.share) {
                navigator.share({
                  title: 'UPI Payment Receipt',
                  text: `Paid ₹${transaction.amount} to ${transaction.title} via UPI. UTR: ${transaction.utr}`,
                });
              } else {
                navigator.clipboard.writeText(
                  `UPI Payment Receipt: Paid ₹${transaction.amount} to ${transaction.title}. Ref: ${transaction.utr}`
                );
                alert('Receipt details copied to clipboard!');
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>Share Receipt</span>
          </button>
        </div>

        {/* Done / Primary Button */}
        <button
          id="close-success-modal-btn"
          onClick={() => {
            sound.playKeyClick();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all active:scale-98 shadow-lg shadow-emerald-500/20"
        >
          Done
        </button>

        {/* NPCI Trust Seal */}
        <div className="mt-3 text-center">
          <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Verified by NPCI UPI 2.0 • Secure Transfer</span>
          </span>
        </div>
      </div>
    </div>
  );
};
