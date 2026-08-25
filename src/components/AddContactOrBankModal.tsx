import React, { useState } from 'react';
import { BankAccount, Contact } from '../types';
import { X, UserPlus, Building, Zap, Check, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface AddContactOrBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CONTACT' | 'BANK' | 'TOPUP_LITE';
  onAddContact: (contact: Contact) => void;
  onAddBank: (bank: BankAccount) => void;
  onTopupLite: (amount: number) => void;
}

export const AddContactOrBankModal: React.FC<AddContactOrBankModalProps> = ({
  isOpen,
  onClose,
  mode,
  onAddContact,
  onAddBank,
  onTopupLite,
}) => {
  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactUpi, setContactUpi] = useState('');

  // Bank state
  const [bankName, setBankName] = useState('Axis Bank');
  const [accNumber, setAccNumber] = useState('');
  const [ifsc, setIfsc] = useState('UTIB0000123');
  const [pin, setPin] = useState('1234');

  // Top up state
  const [topupAmount, setTopupAmount] = useState('500');

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactUpi.trim()) return;

    sound.playPaymentSuccessChime();
    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name: contactName.trim(),
      phone: contactPhone.trim() || '+91 98765 00000',
      upiId: contactUpi.trim(),
      avatar: '',
      initials: contactName.slice(0, 2).toUpperCase(),
      isRecent: true,
    };
    onAddContact(newContact);
    onClose();
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accNumber.trim()) return;

    sound.playPaymentSuccessChime();
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: bankName,
      bankLogo: '🏛️',
      accountNumberMasked: `•••• ${accNumber.slice(-4) || '9999'}`,
      accountType: 'Savings',
      balance: 25000.0,
      isPrimary: false,
      ifsc: ifsc || 'BANK0001234',
      upiPinLength: 4,
      correctPin: pin || '1234',
    };
    onAddBank(newBank);
    onClose();
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topupAmount) || 0;
    if (amt <= 0) return;

    sound.playPaymentSuccessChime();
    onTopupLite(amt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="add-entity-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative"
      >
        {/* Close button */}
        <button
          onClick={() => {
            sound.playKeyClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode 1: ADD CONTACT */}
        {mode === 'CONTACT' && (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Add New Payee Contact</h3>
                <p className="text-[11px] text-slate-400">Save person or merchant for fast payments</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Full Name / Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ramesh@oksbi, ramesh@paytm"
                value={contactUpi}
                onChange={(e) => setContactUpi(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors mt-2"
            >
              Save Contact
            </button>
          </form>
        )}

        {/* Mode 2: LINK NEW BANK ACCOUNT */}
        {mode === 'BANK' && (
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Link Bank Account</h3>
                <p className="text-[11px] text-slate-400">Discover and link accounts via registered SIM</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Select Bank
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Canara Bank">Canara Bank</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Account Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 918237192840"
                value={accNumber}
                onChange={(e) => setAccNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Set 4-Digit UPI PIN for this Bank
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="4-digit PIN (e.g. 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors mt-2"
            >
              Verify & Link Bank Account
            </button>
          </form>
        )}

        {/* Mode 3: TOP UP UPI LITE */}
        {mode === 'TOPUP_LITE' && (
          <form onSubmit={handleTopupSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Top Up UPI Lite Wallet</h3>
                <p className="text-[11px] text-slate-400">Add funds for instant 1-tap pinless payments</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Top Up Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                max="2000"
                required
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full text-lg font-bold font-mono px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-500 text-center"
              />
            </div>

            <div className="flex justify-center gap-2">
              {[200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTopupAmount(val.toString())}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-mono"
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Funds will be debited from primary bank (HDFC Bank •••• 4092)
            </p>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors mt-2"
            >
              Add ₹{topupAmount} to UPI Lite
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
