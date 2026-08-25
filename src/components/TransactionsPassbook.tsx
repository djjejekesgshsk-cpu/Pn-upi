import React, { useState } from 'react';
import { Transaction } from '../types';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Receipt,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Share2,
  X,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TransactionsPassbookProps {
  transactions: Transaction[];
}

export const TransactionsPassbook: React.FC<TransactionsPassbookProps> = ({
  transactions,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<boolean>(false);

  // Calculations
  const totalDebits = transactions
    .filter((t) => t.type === 'DEBIT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter((t) => t.type === 'CREDIT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.recipientVpa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.utr.includes(searchQuery) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'DEBIT') return tx.type === 'DEBIT';
    if (selectedFilter === 'CREDIT') return tx.type === 'CREDIT';
    if (selectedFilter === 'BILLS') return tx.category === 'BILLS' || tx.category === 'RECHARGE';
    if (selectedFilter === 'CASHBACK') return tx.category === 'CASHBACK';

    return true;
  });

  const handleCopyUtr = (utr: string) => {
    sound.playKeyClick();
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return '🍔';
      case 'GROCERY':
        return '🛒';
      case 'BILLS':
        return '⚡';
      case 'RECHARGE':
        return '📱';
      case 'CASHBACK':
        return '🎁';
      case 'TRAVEL':
        return '🚖';
      default:
        return '💸';
    }
  };

  return (
    <section className="px-4 py-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transaction History & Passbook
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {transactions.length}
            </span>
          </div>
        </div>

        {/* Monthly Analytics Summary Card */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Total Spent (Month)
              </span>
              <span className="text-base font-bold text-slate-100 font-mono">
                ₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Total Received
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-transactions-input"
              type="text"
              placeholder="Search by payee, note, UPI ID, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'DEBIT', label: 'Paid' },
              { id: 'CREDIT', label: 'Received' },
              { id: 'BILLS', label: 'Bills' },
              { id: 'CASHBACK', label: 'Cashback' },
            ].map((f) => (
              <button
                key={f.id}
                id={`filter-tx-${f.id}`}
                onClick={() => {
                  sound.playKeyClick();
                  setSelectedFilter(f.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-500 text-xs">
              No transactions match your search or filter
            </div>
          ) : (
            filtered.map((tx) => {
              const isDebit = tx.type === 'DEBIT';
              const dateStr = new Date(tx.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={tx.id}
                  id={`tx-row-${tx.id}`}
                  onClick={() => {
                    sound.playKeyClick();
                    setSelectedTx(tx);
                  }}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-850/90 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate group-hover:text-emerald-300">
                          {tx.title}
                        </h4>
                        {tx.scratchCardEarned && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                            Reward
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {tx.note || tx.bankUsed} • {dateStr}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <div
                      className={`text-xs sm:text-sm font-bold font-mono flex items-center justify-end gap-0.5 ${
                        isDebit ? 'text-slate-100' : 'text-emerald-400'
                      }`}
                    >
                      <span>{isDebit ? '-' : '+'}</span>
                      <span>₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      UTR: {tx.utr.slice(-4)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Transaction Receipt Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
            <div
              id="tx-receipt-modal"
              className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative"
            >
              <button
                id="close-tx-receipt-btn"
                onClick={() => {
                  sound.playKeyClick();
                  setSelectedTx(null);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-2 shadow-inner">
                  {getCategoryIcon(selectedTx.category)}
                </div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  {selectedTx.type === 'DEBIT' ? 'Payment to' : 'Payment from'}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedTx.title}</h3>
                <h2 className="text-3xl font-bold font-mono mt-1 text-slate-100">
                  {selectedTx.type === 'DEBIT' ? '-' : '+'}₹
                  {selectedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>

                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Transaction Successful</span>
                </div>
              </div>

              {/* Receipt Specs */}
              <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/80 space-y-2.5 text-xs mb-4 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI Ref / UTR No</span>
                  <button
                    onClick={() => handleCopyUtr(selectedTx.utr)}
                    className="flex items-center gap-1 text-slate-200 hover:text-emerald-400 font-mono font-medium"
                  >
                    <span>{selectedTx.utr}</span>
                    {copiedUtr ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">To VPA</span>
                  <span className="text-slate-200 font-mono">{selectedTx.recipientVpa}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">From VPA</span>
                  <span className="text-slate-200 font-mono">{selectedTx.senderVpa}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Account</span>
                  <span className="text-slate-200">{selectedTx.bankUsed}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="text-slate-200">
                    {new Date(selectedTx.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedTx.note && (
                  <div className="flex justify-between pt-1 border-t border-slate-700/60">
                    <span className="text-slate-400">Note</span>
                    <span className="text-slate-300 italic">{selectedTx.note}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  sound.playKeyClick();
                  setSelectedTx(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
