import React, { useState } from 'react';
import { Contact, BankAccount } from '../types';
import { PaymentTarget } from './PaymentModal';
import {
  X,
  Search,
  User,
  AtSign,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface PayToUpiOrContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER';
  contacts: Contact[];
  bankAccounts: BankAccount[];
  onSelectTarget: (target: PaymentTarget) => void;
}

export const PayToUpiOrContactModal: React.FC<PayToUpiOrContactModalProps> = ({
  isOpen,
  onClose,
  mode,
  contacts,
  bankAccounts,
  onSelectTarget,
}) => {
  const [query, setQuery] = useState<string>('');
  const [customVpa, setCustomVpa] = useState<string>('');
  const [bankAccNum, setBankAccNum] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('HDFC0001245');
  const [payeeName, setPayeeName] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query) ||
      c.upiId.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    sound.playKeyClick();
    onSelectTarget({
      name: contact.name,
      vpa: contact.upiId,
      phone: contact.phone,
      avatar: contact.avatar,
      initials: contact.initials,
      isVerifiedMerchant: false,
      category: 'TRANSFER',
      defaultAmount: contact.lastAmount,
    });
  };

  const handleVerifyCustomUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVpa.trim()) return;

    setVerifying(true);
    sound.playKeyClick();

    // Simulate instant NPCI Name Verification Lookup (e.g. rahul@oksbi -> Rahul Kumar)
    setTimeout(() => {
      setVerifying(false);
      const vpa = customVpa.trim();
      const extractedName = vpa
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      onSelectTarget({
        name: extractedName || 'Verified Payee',
        vpa: vpa.includes('@') ? vpa : `${vpa}@upi`,
        isVerifiedMerchant: true,
        category: 'TRANSFER',
      });
    }, 450);
  };

  const handleBankTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccNum.trim()) return;

    sound.playKeyClick();
    const bankName = ifsc.startsWith('HDFC')
      ? 'HDFC Bank'
      : ifsc.startsWith('SBIN')
      ? 'SBI'
      : ifsc.startsWith('ICIC')
      ? 'ICICI Bank'
      : 'Beneficiary Bank';

    onSelectTarget({
      name: payeeName.trim() || `Beneficiary (${bankName})`,
      vpa: `${bankAccNum}@${ifsc.slice(0, 4).toLowerCase()}.ifsc.npci`,
      defaultNote: `A/C transfer to ${bankAccNum.slice(-4)}`,
      category: 'TRANSFER',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="pay-target-picker-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              {mode === 'CONTACT' ? (
                <User className="w-5 h-5" />
              ) : mode === 'UPI_ID' ? (
                <AtSign className="w-5 h-5" />
              ) : (
                <Building className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {mode === 'CONTACT'
                  ? 'Pay Contacts & Mobile'
                  : mode === 'UPI_ID'
                  ? 'Pay UPI ID or Number'
                  : 'Transfer to Bank Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'CONTACT'
                  ? 'Search phonebook or enter number'
                  : mode === 'UPI_ID'
                  ? 'Any UPI ID (e.g. name@okhdfcbank)'
                  : 'Direct IMPS / NEFT transfer'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Mode 1: CONTACTS */}
        {mode === 'CONTACT' && (
          <div className="flex flex-col flex-1 overflow-hidden space-y-3">
            <div className="relative flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search name, phone number, or UPI ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No contacts found. You can enter any phone number or UPI ID directly.
                </div>
              ) : (
                filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectContact(c)}
                    className="w-full p-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          c.initials || c.name.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                          {c.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {c.phone} • {c.upiId}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Content Mode 2: PAY UPI ID */}
        {mode === 'UPI_ID' && (
          <form onSubmit={handleVerifyCustomUpi} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Enter UPI ID or UPI Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. mobile@upi, username@okhdfcbank"
                  value={customVpa}
                  onChange={(e) => setCustomVpa(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports @okhdfcbank, @oksbi, @okicici, @paytm, @ybl, @axl, @upi
              </p>
            </div>

            {/* Quick Suffix chips */}
            <div className="flex flex-wrap gap-1.5">
              {['@okhdfcbank', '@oksbi', '@paytm', '@ybl', '@okicici'].map((suf) => (
                <button
                  key={suf}
                  type="button"
                  onClick={() => {
                    sound.playKeyClick();
                    const base = customVpa.split('@')[0];
                    setCustomVpa((base || 'username') + suf);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg border border-slate-700 font-mono"
                >
                  {suf}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!customVpa.trim() || verifying}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying NPCI Name...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Name & Proceed</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Content Mode 3: BANK ACCOUNT TRANSFER */}
        {mode === 'BANK_TRANSFER' && (
          <form onSubmit={handleBankTransferSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Recipient Account Number
              </label>
              <input
                type="text"
                required
                placeholder="Enter bank account number"
                value={bankAccNum}
                onChange={(e) => setBankAccNum(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC0001245, SBIN0004512"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className="w-full text-xs font-mono uppercase px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Account Holder Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Amit Verma"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={!bankAccNum.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors mt-2"
            >
              Proceed to Transfer
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
