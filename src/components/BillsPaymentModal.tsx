import React, { useState } from 'react';
import { BillerCategory } from '../types';
import { PaymentTarget } from './PaymentModal';
import {
  X,
  CheckCircle2,
  Receipt,
  Smartphone,
  Zap,
  Car,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface BillsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: BillerCategory | null;
  onProceedToPay: (target: PaymentTarget) => void;
}

export const BillsPaymentModal: React.FC<BillsPaymentModalProps> = ({
  isOpen,
  onClose,
  category,
  onProceedToPay,
}) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [consumerNumber, setConsumerNumber] = useState<string>('');
  const [selectedPlanAmount, setSelectedPlanAmount] = useState<number>(0);
  const [fetchedBill, setFetchedBill] = useState<boolean>(false);

  if (!isOpen || !category) return null;

  const selectedOperator = category.operators.find((op) => op.id === selectedOperatorId);

  const handleSelectOperator = (opId: string) => {
    sound.playKeyClick();
    setSelectedOperatorId(opId);
    setFetchedBill(false);
    setSelectedPlanAmount(0);
  };

  const handleFetchBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumerNumber || !selectedOperator) return;

    sound.playKeyClick();
    setFetchedBill(true);
    setSelectedPlanAmount(selectedOperator.sampleBillAmount);
  };

  const handleProceed = () => {
    if (!selectedOperator || selectedPlanAmount <= 0) return;

    sound.playKeyClick();
    onProceedToPay({
      name: selectedOperator.name,
      vpa: `${selectedOperator.id}.billpay@npci`,
      defaultAmount: selectedPlanAmount,
      defaultNote: `${category.name} for ${consumerNumber || 'Acct'}`,
      isVerifiedMerchant: true,
      category: 'BILLS',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="bills-payment-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{category.name}</h3>
              <p className="text-[11px] text-slate-400">Bharat BillPay (BBPS) Verified</p>
            </div>
          </div>

          <button
            id="close-bills-btn"
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
          {/* Step 1: Select Operator */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Operator / Provider
            </label>
            <div className="grid grid-cols-1 gap-2">
              {category.operators.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => handleSelectOperator(op.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                    selectedOperatorId === op.id
                      ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{op.logo}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{op.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {op.accountLabel} required
                      </p>
                    </div>
                  </div>
                  {selectedOperatorId === op.id && (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Enter Account/Number */}
          {selectedOperator && (
            <form onSubmit={handleFetchBill} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Enter {selectedOperator.accountLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${
                      selectedOperator.accountLabel.includes('Mobile')
                        ? '9876543210'
                        : '1002938491'
                    }`}
                    value={consumerNumber}
                    onChange={(e) => {
                      setConsumerNumber(e.target.value);
                      setFetchedBill(false);
                    }}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-100 font-bold text-xs transition-colors"
                  >
                    Fetch Bill
                  </button>
                </div>
              </div>

              {/* Fetched Bill Summary */}
              {fetchedBill && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/30 via-slate-800 to-slate-850 border border-blue-500/40 animate-fadeIn space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Customer Name</span>
                    <span className="text-xs font-bold text-slate-200">Nilesh Patel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Bill Due Amount</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ₹{selectedPlanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                    <span>Due Date</span>
                    <span>30 Aug 2026</span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Button */}
        {fetchedBill && (
          <div className="pt-3 border-t border-slate-800 flex-shrink-0">
            <button
              onClick={handleProceed}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pay ₹{selectedPlanAmount} with UPI</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
