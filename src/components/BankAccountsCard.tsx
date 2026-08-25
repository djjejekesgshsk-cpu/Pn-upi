import React, { useState } from 'react';
import { BankAccount } from '../types';
import {
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  Plus,
  Zap,
  Building,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface BankAccountsCardProps {
  accounts: BankAccount[];
  upiLiteBalance: number;
  onCheckBalance: (account: BankAccount) => void;
  onSetPrimary: (accountId: string) => void;
  onAddBank: () => void;
  onTopupUpiLite: () => void;
  visibleBalances: Record<string, boolean>;
}

export const BankAccountsCard: React.FC<BankAccountsCardProps> = ({
  accounts,
  upiLiteBalance,
  onCheckBalance,
  onSetPrimary,
  onAddBank,
  onTopupUpiLite,
  visibleBalances,
}) => {
  return (
    <section className="px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Linked Bank Accounts & Wallet
            </h2>
          </div>

          <button
            id="link-new-bank-btn"
            onClick={() => {
              sound.playKeyClick();
              onAddBank();
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bank</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Linked Bank Accounts */}
          {accounts.map((acc) => {
            const isRevealed = visibleBalances[acc.id];

            return (
              <div
                key={acc.id}
                id={`bank-card-${acc.id}`}
                className={`relative rounded-2xl p-4 border transition-all duration-200 ${
                  acc.isPrimary
                    ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Primary Badge */}
                {acc.isPrimary && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Primary</span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xl shadow-inner">
                    {acc.bankLogo}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{acc.bankName}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {acc.accountType} • {acc.accountNumberMasked}
                    </p>
                  </div>
                </div>

                {/* Balance Area */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                      Account Balance
                    </span>
                    {isRevealed ? (
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono tracking-widest">
                        ••••••••
                      </span>
                    )}
                  </div>

                  <button
                    id={`check-bal-btn-${acc.id}`}
                    onClick={() => {
                      sound.playKeyClick();
                      onCheckBalance(acc);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                      isRevealed
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {isRevealed ? (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Check Balance</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Make Primary Action if not already */}
                {!acc.isPrimary && (
                  <button
                    id={`set-primary-${acc.id}`}
                    onClick={() => {
                      sound.playKeyClick();
                      onSetPrimary(acc.id);
                    }}
                    className="mt-2.5 w-full text-center text-[10px] text-slate-400 hover:text-emerald-400 transition-colors py-1 rounded hover:bg-slate-800/40"
                  >
                    Set as default receiving account
                  </button>
                )}
              </div>
            );
          })}

          {/* UPI Lite Wallet Quick Card */}
          <div
            id="upi-lite-card"
            className="rounded-2xl p-4 border bg-gradient-to-br from-cyan-950/20 via-slate-900 to-slate-900 border-cyan-500/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                      UPI Lite
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        PINLESS
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Zero failure, instant under ₹500</p>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                  Available Wallet Balance
                </span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  ₹{upiLiteBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">Max limit ₹2,000</span>
              <button
                id="topup-upi-lite-btn"
                onClick={() => {
                  sound.playKeyClick();
                  onTopupUpiLite();
                }}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all active:scale-95 flex items-center gap-1 shadow-sm shadow-cyan-500/20"
              >
                <Plus className="w-3 h-3" />
                <span>Top Up</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
