import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Reward } from '../types';
import {
  X,
  Gift,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Coins,
  Ticket,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: Reward[];
  onClaimReward: (rewardId: string) => void;
  activeScratchId?: string | null;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onClaimReward,
  activeScratchId,
}) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isScratchedLocal, setIsScratchedLocal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (activeScratchId) {
        const found = rewards.find((r) => r.id === activeScratchId);
        if (found) setSelectedReward(found);
      } else {
        setSelectedReward(null);
      }
    }
  }, [isOpen, activeScratchId, rewards]);

  // Initialize Canvas scratch layer when a reward is opened
  useEffect(() => {
    if (selectedReward && !selectedReward.isScratched && !isScratchedLocal) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw metallic scratch coat
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add shimmer pattern
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Scratch Here to Reveal ✨', canvas.width / 2, canvas.height / 2 + 6);
    }
  }, [selectedReward, isScratchedLocal]);

  if (!isOpen) return null;

  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedReward || selectedReward.isScratched || isScratchedLocal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch percentage roughly
    sound.playKeyClick();

    // Automatically complete after a few scratches
    if (Math.random() > 0.75) {
      triggerScratchComplete();
    }
  };

  const triggerScratchComplete = () => {
    if (isScratchedLocal || !selectedReward) return;
    setIsScratchedLocal(true);
    sound.playPaymentSuccessChime();

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    } catch {}

    onClaimReward(selectedReward.id);
  };

  const handleCopyCode = (code: string) => {
    sound.playKeyClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const unscratchedList = rewards.filter((r) => !r.isScratched);
  const claimedList = rewards.filter((r) => r.isScratched);

  const totalCashbackWon = rewards
    .filter((r) => r.isScratched && r.cashbackAmount)
    .reduce((sum, r) => sum + (r.cashbackAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="rewards-modal-container"
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">UPI Rewards & Cashback</h3>
              <p className="text-[11px] text-amber-400 font-mono">
                Total Cashback Won: ₹{totalCashbackWon}
              </p>
            </div>
          </div>

          <button
            id="close-rewards-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1">
          {/* Active Scratch Card Viewer */}
          {selectedReward ? (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-amber-500/40 text-center relative overflow-hidden">
              <button
                onClick={() => setSelectedReward(null)}
                className="absolute top-3 left-3 text-xs text-slate-400 hover:text-slate-200"
              >
                ← Back to all
              </button>

              <div className="mt-4 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {selectedReward.brand}
                </span>
                <h3 className="text-lg font-bold text-slate-100">{selectedReward.title}</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  {selectedReward.description}
                </p>
              </div>

              {/* Interactive Scratch Canvas or Revealed Prize */}
              {!selectedReward.isScratched && !isScratchedLocal ? (
                <div className="relative w-64 h-36 mx-auto my-3 rounded-2xl overflow-hidden shadow-lg border border-slate-700 bg-gradient-to-br from-amber-500/30 via-slate-800 to-amber-600/30 flex items-center justify-center">
                  {/* Underneath prize */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-3xl mb-1">{selectedReward.logo}</span>
                    <span className="text-base font-bold text-slate-100">
                      {selectedReward.type === 'CASHBACK'
                        ? `₹${selectedReward.cashbackAmount} Direct Cashback`
                        : selectedReward.discountCode}
                    </span>
                  </div>

                  {/* Canvas coat over it */}
                  <canvas
                    ref={canvasRef}
                    width={256}
                    height={144}
                    onMouseMove={handleScratch}
                    onTouchMove={handleScratch}
                    onClick={triggerScratchComplete}
                    className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
                  />
                </div>
              ) : (
                <div className="w-64 h-36 mx-auto my-3 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-800 to-emerald-900/30 border border-emerald-500/50 flex flex-col items-center justify-center p-3 shadow-inner">
                  <span className="text-3xl mb-1">{selectedReward.logo}</span>
                  {selectedReward.type === 'CASHBACK' ? (
                    <>
                      <span className="text-xl font-bold text-emerald-400 font-mono">
                        +₹{selectedReward.cashbackAmount} Won!
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Credited to Primary Bank A/c
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-400">Coupon Code:</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <code className="px-2.5 py-1 bg-slate-900 rounded-lg text-xs font-bold text-amber-300 font-mono border border-slate-700">
                          {selectedReward.discountCode}
                        </code>
                        <button
                          onClick={() => handleCopyCode(selectedReward.discountCode || '')}
                          className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          {copiedCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!selectedReward.isScratched && !isScratchedLocal && (
                <button
                  onClick={triggerScratchComplete}
                  className="text-xs text-amber-300 underline font-medium"
                >
                  Or tap here to reveal instantly
                </button>
              )}
            </div>
          ) : null}

          {/* Unscratched Cards */}
          {unscratchedList.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mystery Cards to Scratch ({unscratchedList.length})</span>
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {unscratchedList.map((card) => (
                  <button
                    key={card.id}
                    id={`unscratched-card-${card.id}`}
                    onClick={() => {
                      sound.playKeyClick();
                      setSelectedReward(card);
                      setIsScratchedLocal(false);
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-amber-600/10 border border-amber-500/40 hover:border-amber-400 text-left transition-all active:scale-95 group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                      🎁
                    </div>
                    <span className="text-xs font-bold text-slate-100 block truncate">
                      {card.title}
                    </span>
                    <span className="text-[10px] text-amber-300 block mt-0.5">
                      Tap to scratch ✨
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Claimed / Past Rewards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Claimed Rewards & Coupons
            </h4>
            <div className="space-y-2">
              {claimedList.map((card) => (
                <div
                  key={card.id}
                  className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
                      {card.logo}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">{card.title}</h5>
                      <p className="text-[10px] text-slate-400">{card.brand} • Expires {card.expiresAt}</p>
                    </div>
                  </div>

                  {card.discountCode ? (
                    <button
                      onClick={() => handleCopyCode(card.discountCode || '')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1"
                    >
                      <span>{card.discountCode}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +₹{card.cashbackAmount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
