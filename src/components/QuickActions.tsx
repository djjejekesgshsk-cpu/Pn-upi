import React from 'react';
import {
  QrCode,
  Users,
  AtSign,
  Building2,
  Zap,
  Receipt,
  Split,
  Gift,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface QuickActionsProps {
  onScanQr: () => void;
  onPayContact: () => void;
  onPayUpiId: () => void;
  onBankTransfer: () => void;
  onOpenUpiLite: () => void;
  onOpenBills: () => void;
  onOpenSplit: () => void;
  onOpenRewards: () => void;
  upiLiteBalance: number;
  unscratchedRewardsCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onScanQr,
  onPayContact,
  onPayUpiId,
  onBankTransfer,
  onOpenUpiLite,
  onOpenBills,
  onOpenSplit,
  onOpenRewards,
  upiLiteBalance,
  unscratchedRewardsCount,
}) => {
  const actions = [
    {
      id: 'action-scan-qr',
      title: 'Scan QR',
      subtitle: 'Any UPI QR',
      icon: QrCode,
      onClick: onScanQr,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40',
      badge: 'Camera/Upload',
      isHero: true,
    },
    {
      id: 'action-pay-contact',
      title: 'Pay Contact',
      subtitle: 'Mobile Number',
      icon: Users,
      onClick: onPayContact,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40',
      isHero: true,
    },
    {
      id: 'action-pay-upi-id',
      title: 'Pay UPI ID',
      subtitle: 'VPA or Number',
      icon: AtSign,
      onClick: onPayUpiId,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40',
    },
    {
      id: 'action-bank-transfer',
      title: 'Bank Transfer',
      subtitle: 'A/c + IFSC',
      icon: Building2,
      onClick: onBankTransfer,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40',
    },
    {
      id: 'action-upi-lite',
      title: 'UPI Lite',
      subtitle: `₹${upiLiteBalance.toLocaleString('en-IN')}`,
      icon: Zap,
      onClick: onOpenUpiLite,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40',
      badge: 'PIN-less < ₹500',
    },
    {
      id: 'action-pay-bills',
      title: 'Bills & DTH',
      subtitle: 'Recharge & Util',
      icon: Receipt,
      onClick: onOpenBills,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40',
    },
    {
      id: 'action-split-bill',
      title: 'Split Bill',
      subtitle: 'With Friends',
      icon: Split,
      onClick: onOpenSplit,
      color: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/40',
    },
    {
      id: 'action-rewards',
      title: 'Rewards',
      subtitle: 'Cashback & Offers',
      icon: Gift,
      onClick: onOpenRewards,
      color: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40',
      badge: unscratchedRewardsCount > 0 ? `${unscratchedRewardsCount} Mystery` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
  ];

  return (
    <section className="px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Transfer Money
          </h2>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            NPCI 24x7 Instant
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                id={action.id}
                onClick={() => {
                  sound.playKeyClick();
                  action.onClick();
                }}
                className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-150 active:scale-95 group text-center ${action.color} bg-slate-900/60`}
              >
                {action.badge && (
                  <span
                    className={`absolute -top-1.5 -right-1 px-1.5 py-0.5 text-[9px] rounded-full shadow-sm ${
                      action.badgeColor || 'bg-emerald-500 text-slate-950 font-semibold'
                    }`}
                  >
                    {action.badge}
                  </span>
                )}

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 shadow-inner">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <span className="text-xs font-semibold text-slate-100 line-clamp-1">
                  {action.title}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 font-medium">
                  {action.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
