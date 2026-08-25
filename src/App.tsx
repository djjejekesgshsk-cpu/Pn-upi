/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BankAccount,
  Contact,
  Transaction,
  Reward,
  SplitGroup,
  BillerCategory,
} from './types';
import {
  loadBankAccounts,
  saveBankAccounts,
  loadUpiLiteBalance,
  saveUpiLiteBalance,
  loadContacts,
  saveContacts,
  loadTransactions,
  saveTransactions,
  loadRewards,
  saveRewards,
  loadSplitGroups,
  saveSplitGroups,
  loadSettings,
  saveSettings,
  AppSettings,
  generate12DigitUTR,
} from './utils/storage';
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CONTACTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REWARDS,
  INITIAL_SPLIT_GROUPS,
  BILLER_CATEGORIES,
} from './data/mockData';
import { sound } from './utils/audio';

// Components
import { Header } from './components/Header';
import { QuickActions } from './components/QuickActions';
import { PeopleSection } from './components/PeopleSection';
import { BankAccountsCard } from './components/BankAccountsCard';
import { BillsSection } from './components/BillsSection';
import { SoundboxWidget } from './components/SoundboxWidget';
import { TransactionsPassbook } from './components/TransactionsPassbook';

// Modals
import { PaymentModal, PaymentTarget } from './components/PaymentModal';
import { UpiPinModal } from './components/UpiPinModal';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { QrScannerModal } from './components/QrScannerModal';
import { MyQrModal } from './components/MyQrModal';
import { RewardsModal } from './components/RewardsModal';
import { SplitBillModal } from './components/SplitBillModal';
import { BillsPaymentModal } from './components/BillsPaymentModal';
import { AddContactOrBankModal } from './components/AddContactOrBankModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PayToUpiOrContactModal } from './components/PayToUpiOrContactModal';

import { Smartphone, Monitor, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  // Persistence states
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [upiLiteBalance, setUpiLiteBalance] = useState<number>(1450);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    soundboxVoiceEnabled: true,
    soundboxLanguage: 'en-IN',
    biometricEnabled: true,
  });

  // UI / View State
  const [isMobileShell, setIsMobileShell] = useState<boolean>(false);
  const [visibleBalances, setVisibleBalances] = useState<Record<string, boolean>>({});

  // Active Modals state
  const [isMyQrOpen, setIsMyQrOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [activeScratchCardId, setActiveScratchCardId] = useState<string | null>(null);
  const [isSplitOpen, setIsSplitOpen] = useState<boolean>(false);
  const [selectedBillerCategory, setSelectedBillerCategory] = useState<BillerCategory | null>(null);

  // Pay target modals
  const [payPickerMode, setPayPickerMode] = useState<'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER' | null>(null);
  const [addEntityMode, setAddEntityMode] = useState<'CONTACT' | 'BANK' | 'TOPUP_LITE' | null>(null);

  // Active Payment Execution State
  const [activePaymentTarget, setActivePaymentTarget] = useState<PaymentTarget | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [pendingPinDetails, setPendingPinDetails] = useState<{
    target: PaymentTarget;
    amount: number;
    note: string;
    selectedBank: BankAccount;
    useUpiLite: boolean;
  } | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinModalMode, setPinModalMode] = useState<'PAYMENT' | 'CHECK_BALANCE' | 'SET_PIN'>('PAYMENT');
  const [pinTargetBank, setPinTargetBank] = useState<BankAccount | null>(null);

  // Success Modal
  const [lastSuccessfulTx, setLastSuccessfulTx] = useState<Transaction | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Initial Data Loading
  useEffect(() => {
    const loadedBanks = loadBankAccounts();
    const loadedLite = loadUpiLiteBalance();
    const loadedContacts = loadContacts();
    const loadedTxs = loadTransactions();
    const loadedRew = loadRewards();
    const loadedSplits = loadSplitGroups();
    const loadedSet = loadSettings();

    setBankAccounts(loadedBanks);
    setUpiLiteBalance(loadedLite);
    setContacts(loadedContacts);
    setTransactions(loadedTxs);
    setRewards(loadedRew);
    setSplitGroups(loadedSplits);
    setSettings(loadedSet);

    sound.setSoundEnabled(loadedSet.soundEnabled);
    sound.setSoundboxVoiceEnabled(loadedSet.soundboxVoiceEnabled);
    sound.setSoundboxLanguage(loadedSet.soundboxLanguage);
  }, []);

  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0] || INITIAL_BANK_ACCOUNTS[0];
  const unscratchedRewards = rewards.filter((r) => !r.isScratched).length;

  // Toggle Sound
  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextState };
    setSettings(updated);
    saveSettings(updated);
    sound.setSoundEnabled(nextState);
  };

  const handleToggleSoundboxVoice = () => {
    const nextState = !settings.soundboxVoiceEnabled;
    const updated = { ...settings, soundboxVoiceEnabled: nextState };
    setSettings(updated);
    saveSettings(updated);
    sound.setSoundboxVoiceEnabled(nextState);
  };

  const handleChangeLanguage = (lang: 'hi-IN' | 'en-IN') => {
    const updated = { ...settings, soundboxLanguage: lang };
    setSettings(updated);
    saveSettings(updated);
    sound.setSoundboxLanguage(lang);
  };

  // Check Balance with PIN
  const handleCheckBalance = (account: BankAccount) => {
    setPinTargetBank(account);
    setPinModalMode('CHECK_BALANCE');
    setIsPinModalOpen(true);
  };

  // Set Primary Bank
  const handleSetPrimaryBank = (accountId: string) => {
    const updated = bankAccounts.map((b) => ({
      ...b,
      isPrimary: b.id === accountId,
    }));
    setBankAccounts(updated);
    saveBankAccounts(updated);
  };

  // Start Payment to Target
  const handleStartPayment = (target: PaymentTarget) => {
    setActivePaymentTarget(target);
    setIsPaymentModalOpen(true);
    // Close other pickers
    setPayPickerMode(null);
    setIsScannerOpen(false);
    setSelectedBillerCategory(null);
  };

  // Initiate PIN or direct UPI Lite execution
  const handleInitiatePin = (details: {
    target: PaymentTarget;
    amount: number;
    note: string;
    selectedBank: BankAccount;
    useUpiLite: boolean;
  }) => {
    setIsPaymentModalOpen(false);

    if (details.useUpiLite) {
      // 1-Tap PINLESS payment via UPI Lite
      executePayment(details);
    } else {
      // Prompt for NPCI UPI PIN
      setPendingPinDetails(details);
      setPinTargetBank(details.selectedBank);
      setPinModalMode('PAYMENT');
      setIsPinModalOpen(true);
    }
  };

  // Final execution of payment
  const executePayment = (details: {
    target: PaymentTarget;
    amount: number;
    note: string;
    selectedBank: BankAccount;
    useUpiLite: boolean;
  }) => {
    const utr = generate12DigitUTR();

    // 50% chance of generating a reward scratch card if payment > ₹100
    const earnReward = details.amount >= 100 && Math.random() > 0.3;
    let earnedRewardId: string | undefined = undefined;

    if (earnReward) {
      const isCashback = Math.random() > 0.4;
      const newReward: Reward = {
        id: `rew-${Date.now()}`,
        title: isCashback ? 'Mystery Cashback' : 'Brand Discount Coupon',
        description: isCashback
          ? 'Scratch to reveal direct bank cashback'
          : 'Exclusive offer from partner merchant',
        brand: isCashback ? 'UPI Cashback' : 'Zomato Special',
        brandColor: isCashback ? '#059669' : '#E23744',
        logo: isCashback ? '💰' : '🍕',
        cashbackAmount: isCashback ? Math.floor(15 + Math.random() * 45) : undefined,
        discountCode: !isCashback ? `UPI${Math.floor(100 + Math.random() * 900)}` : undefined,
        isScratched: false,
        expiresAt: '2026-09-30',
        type: isCashback ? 'CASHBACK' : 'VOUCHER',
      };
      earnedRewardId = newReward.id;
      const updatedRewards = [newReward, ...rewards];
      setRewards(updatedRewards);
      saveRewards(updatedRewards);
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      utr,
      title: details.target.name,
      recipientVpa: details.target.vpa,
      senderVpa: primaryBank ? 'pn.nilesh@okhdfcbank' : 'user@upi',
      amount: details.amount,
      type: 'DEBIT',
      category: details.target.category || 'TRANSFER',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      bankUsed: details.useUpiLite
        ? 'UPI Lite'
        : `${details.selectedBank.bankName} ${details.selectedBank.accountNumberMasked}`,
      note: details.note,
      scratchCardEarned: earnReward,
      scratchCardId: earnedRewardId,
    };

    // Update balances
    if (details.useUpiLite) {
      const nextLiteBal = upiLiteBalance - details.amount;
      setUpiLiteBalance(nextLiteBal);
      saveUpiLiteBalance(nextLiteBal);
    } else {
      const nextBanks = bankAccounts.map((b) =>
        b.id === details.selectedBank.id
          ? { ...b, balance: b.balance - details.amount }
          : b
      );
      setBankAccounts(nextBanks);
      saveBankAccounts(nextBanks);
    }

    // Save transaction
    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    saveTransactions(nextTxs);

    // Show celebratory modal
    setLastSuccessfulTx(newTx);
    setIsSuccessModalOpen(true);
    setPendingPinDetails(null);
  };

  // Claim scratch card
  const handleClaimReward = (rewardId: string) => {
    const targetReward = rewards.find((r) => r.id === rewardId);
    if (!targetReward) return;

    const updatedRewards = rewards.map((r) =>
      r.id === rewardId ? { ...r, isScratched: true } : r
    );
    setRewards(updatedRewards);
    saveRewards(updatedRewards);

    // If cashback, deposit into primary bank
    if (targetReward.type === 'CASHBACK' && targetReward.cashbackAmount) {
      const cashbackAmt = targetReward.cashbackAmount;
      const updatedBanks = bankAccounts.map((b) =>
        b.isPrimary ? { ...b, balance: b.balance + cashbackAmt } : b
      );
      setBankAccounts(updatedBanks);
      saveBankAccounts(updatedBanks);

      // Record credit transaction
      const cashbackTx: Transaction = {
        id: `tx-cb-${Date.now()}`,
        utr: generate12DigitUTR(),
        title: 'UPI Cashback Reward',
        recipientVpa: 'pn.nilesh@okhdfcbank',
        senderVpa: 'rewards.npci@upi',
        amount: cashbackAmt,
        type: 'CREDIT',
        category: 'CASHBACK',
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        bankUsed: `${primaryBank.bankName} ${primaryBank.accountNumberMasked}`,
        note: `Direct cashback credited for ${targetReward.title}`,
      };
      const nextTxs = [cashbackTx, ...transactions];
      setTransactions(nextTxs);
      saveTransactions(nextTxs);
    }
  };

  // Reset to demo data
  const handleResetDemoData = () => {
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    saveBankAccounts(INITIAL_BANK_ACCOUNTS);
    setUpiLiteBalance(1450);
    saveUpiLiteBalance(1450);
    setContacts(INITIAL_CONTACTS);
    saveContacts(INITIAL_CONTACTS);
    setTransactions(INITIAL_TRANSACTIONS);
    saveTransactions(INITIAL_TRANSACTIONS);
    setRewards(INITIAL_REWARDS);
    saveRewards(INITIAL_REWARDS);
    setSplitGroups(INITIAL_SPLIT_GROUPS);
    saveSplitGroups(INITIAL_SPLIT_GROUPS);
    setVisibleBalances({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 pb-12">
      {/* Top Utility View Toggle */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BHARAT UPI 2.0 • NPCI SECURE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileShell(!isMobileShell)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              {isMobileShell ? (
                <>
                  <Monitor className="w-3 h-3 text-emerald-400" />
                  <span>Full Screen View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span>Phone Mockup Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main App Container (Adaptive or Phone Shell) */}
      <main
        className={`mx-auto transition-all duration-300 ${
          isMobileShell
            ? 'max-w-sm my-6 rounded-[2.5rem] border-8 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-slate-700'
            : 'max-w-4xl'
        }`}
      >
        {/* Header */}
        <Header
          onOpenMyQr={() => setIsMyQrOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          soundEnabled={settings.soundEnabled}
          onToggleSound={handleToggleSound}
          unreadCount={unscratchedRewards > 0 ? 1 : 0}
        />

        {/* Primary 8 Quick Action Hub */}
        <QuickActions
          onScanQr={() => setIsScannerOpen(true)}
          onPayContact={() => setPayPickerMode('CONTACT')}
          onPayUpiId={() => setPayPickerMode('UPI_ID')}
          onBankTransfer={() => setPayPickerMode('BANK_TRANSFER')}
          onOpenUpiLite={() => setAddEntityMode('TOPUP_LITE')}
          onOpenBills={() => setSelectedBillerCategory(BILLER_CATEGORIES[0])}
          onOpenSplit={() => setIsSplitOpen(true)}
          onOpenRewards={() => setIsRewardsOpen(true)}
          upiLiteBalance={upiLiteBalance}
          unscratchedRewardsCount={unscratchedRewards}
        />

        {/* People & Frequent Merchants */}
        <PeopleSection
          contacts={contacts}
          onSelectContact={(contact) =>
            handleStartPayment({
              name: contact.name,
              vpa: contact.upiId,
              phone: contact.phone,
              avatar: contact.avatar,
              initials: contact.initials,
              defaultAmount: contact.lastAmount,
              category: 'TRANSFER',
            })
          }
          onAddNewContact={() => setAddEntityMode('CONTACT')}
        />

        {/* Linked Bank Accounts Carousel with Balance Check */}
        <BankAccountsCard
          accounts={bankAccounts}
          upiLiteBalance={upiLiteBalance}
          onCheckBalance={handleCheckBalance}
          onSetPrimary={handleSetPrimaryBank}
          onAddBank={() => setAddEntityMode('BANK')}
          onTopupUpiLite={() => setAddEntityMode('TOPUP_LITE')}
          visibleBalances={visibleBalances}
        />

        {/* Utilities & BBPS Bills Grid */}
        <BillsSection
          onSelectBillerCategory={(cat) => setSelectedBillerCategory(cat)}
          onSelectSpecificOperator={(cat, opId) => {
            setSelectedBillerCategory(cat);
          }}
        />

        {/* Smart Voice Soundbox Simulator */}
        <SoundboxWidget
          soundEnabled={settings.soundEnabled}
          soundboxVoiceEnabled={settings.soundboxVoiceEnabled}
          soundboxLanguage={settings.soundboxLanguage}
          onToggleSoundboxVoice={handleToggleSoundboxVoice}
          onChangeLanguage={handleChangeLanguage}
          lastAmount={lastSuccessfulTx?.amount || 500}
        />

        {/* Live Transaction Passbook & Expense Analytics */}
        <TransactionsPassbook transactions={transactions} />
      </main>

      {/* MODALS */}

      {/* 1. Payment Modal (Amount + Note + Bank Picker) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        target={activePaymentTarget}
        bankAccounts={bankAccounts}
        upiLiteBalance={upiLiteBalance}
        onInitiatePin={handleInitiatePin}
      />

      {/* 2. NPCI UPI PIN Modal */}
      {pinTargetBank && (
        <UpiPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          bank={pinTargetBank}
          target={pendingPinDetails?.target}
          amount={pendingPinDetails?.amount}
          mode={pinModalMode}
          onSuccess={() => {
            setIsPinModalOpen(false);
            if (pinModalMode === 'CHECK_BALANCE') {
              sound.playPaymentSuccessChime();
              setVisibleBalances((prev) => ({
                ...prev,
                [pinTargetBank.id]: true,
              }));
            } else if (pinModalMode === 'PAYMENT' && pendingPinDetails) {
              executePayment(pendingPinDetails);
            }
          }}
        />
      )}

      {/* 3. Payment Success Celebration Modal */}
      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        transaction={lastSuccessfulTx}
        onOpenScratchCard={(rewId) => {
          setIsSuccessModalOpen(false);
          setActiveScratchCardId(rewId);
          setIsRewardsOpen(true);
        }}
        onSplitBill={(tx) => {
          setIsSuccessModalOpen(false);
          setIsSplitOpen(true);
        }}
      />

      {/* 4. QR Scanner */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(target) => handleStartPayment(target)}
      />

      {/* 5. My QR Code */}
      <MyQrModal
        isOpen={isMyQrOpen}
        onClose={() => setIsMyQrOpen(false)}
        primaryBank={primaryBank}
      />

      {/* 6. Contact / UPI ID / Bank Transfer Picker */}
      <PayToUpiOrContactModal
        isOpen={payPickerMode !== null}
        onClose={() => setPayPickerMode(null)}
        mode={payPickerMode || 'CONTACT'}
        contacts={contacts}
        bankAccounts={bankAccounts}
        onSelectTarget={(target) => handleStartPayment(target)}
      />

      {/* 7. Bills & Recharges Operator Modal */}
      <BillsPaymentModal
        isOpen={selectedBillerCategory !== null}
        onClose={() => setSelectedBillerCategory(null)}
        category={selectedBillerCategory}
        onProceedToPay={(target) => handleStartPayment(target)}
      />

      {/* 8. Scratch Cards & Rewards Center */}
      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => {
          setIsRewardsOpen(false);
          setActiveScratchCardId(null);
        }}
        rewards={rewards}
        onClaimReward={handleClaimReward}
        activeScratchId={activeScratchCardId}
      />

      {/* 9. Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
        contacts={contacts}
        splitGroups={splitGroups}
        onSaveGroup={(group) => {
          const updated = splitGroups.some((g) => g.id === group.id)
            ? splitGroups.map((g) => (g.id === group.id ? group : g))
            : [group, ...splitGroups];
          setSplitGroups(updated);
          saveSplitGroups(updated);
        }}
      />

      {/* 10. Add Payee / Link Bank / Top Up Lite Modal */}
      <AddContactOrBankModal
        isOpen={addEntityMode !== null}
        onClose={() => setAddEntityMode(null)}
        mode={addEntityMode || 'CONTACT'}
        onAddContact={(newContact) => {
          const next = [newContact, ...contacts];
          setContacts(next);
          saveContacts(next);
        }}
        onAddBank={(newBank) => {
          const next = [...bankAccounts, newBank];
          setBankAccounts(next);
          saveBankAccounts(next);
        }}
        onTopupLite={(amount) => {
          const nextLite = upiLiteBalance + amount;
          setUpiLiteBalance(nextLite);
          saveUpiLiteBalance(nextLite);

          // Deduct from primary bank
          const nextBanks = bankAccounts.map((b) =>
            b.isPrimary ? { ...b, balance: b.balance - amount } : b
          );
          setBankAccounts(nextBanks);
          saveBankAccounts(nextBanks);
        }}
      />

      {/* 11. Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
          sound.setSoundEnabled(newSettings.soundEnabled);
          sound.setSoundboxVoiceEnabled(newSettings.soundboxVoiceEnabled);
          sound.setSoundboxLanguage(newSettings.soundboxLanguage);
        }}
        onResetDemoData={handleResetDemoData}
        onOpenMyQr={() => setIsMyQrOpen(true)}
      />

      {/* 12. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onPayNotificationRequest={(name, upiId, amount) => {
          handleStartPayment({
            name,
            vpa: upiId,
            defaultAmount: amount,
            defaultNote: 'Payment Request clearance',
            category: 'TRANSFER',
          });
        }}
      />
    </div>
  );
}
