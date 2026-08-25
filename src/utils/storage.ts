import { BankAccount, Contact, Transaction, Reward, SplitGroup } from '../types';
import {
  CURRENT_USER,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CONTACTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REWARDS,
  INITIAL_SPLIT_GROUPS,
} from '../data/mockData';

const STORAGE_KEYS = {
  BANK_ACCOUNTS: 'upi_app_bank_accounts_v1',
  UPI_LITE_BALANCE: 'upi_app_upi_lite_balance_v1',
  CONTACTS: 'upi_app_contacts_v1',
  TRANSACTIONS: 'upi_app_transactions_v1',
  REWARDS: 'upi_app_rewards_v1',
  SPLIT_GROUPS: 'upi_app_split_groups_v1',
  SETTINGS: 'upi_app_settings_v1',
};

export interface AppSettings {
  soundEnabled: boolean;
  soundboxVoiceEnabled: boolean;
  soundboxLanguage: 'hi-IN' | 'en-IN';
  biometricEnabled: boolean;
}

export function loadBankAccounts(): BankAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveBankAccounts(INITIAL_BANK_ACCOUNTS);
  return INITIAL_BANK_ACCOUNTS;
}

export function saveBankAccounts(accounts: BankAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts));
  } catch {}
}

export function loadUpiLiteBalance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPI_LITE_BALANCE);
    if (raw !== null) return Number(raw);
  } catch {}
  saveUpiLiteBalance(1450);
  return 1450;
}

export function saveUpiLiteBalance(bal: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.UPI_LITE_BALANCE, bal.toString());
  } catch {}
}

export function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveContacts(INITIAL_CONTACTS);
  return INITIAL_CONTACTS;
}

export function saveContacts(contacts: Contact[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch {}
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveTransactions(INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch {}
}

export function loadRewards(): Reward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REWARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveRewards(INITIAL_REWARDS);
  return INITIAL_REWARDS;
}

export function saveRewards(rewards: Reward[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
  } catch {}
}

export function loadSplitGroups(): SplitGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPLIT_GROUPS);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveSplitGroups(INITIAL_SPLIT_GROUPS);
  return INITIAL_SPLIT_GROUPS;
}

export function saveSplitGroups(groups: SplitGroup[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPLIT_GROUPS, JSON.stringify(groups));
  } catch {}
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults: AppSettings = {
    soundEnabled: true,
    soundboxVoiceEnabled: true,
    soundboxLanguage: 'en-IN',
    biometricEnabled: true,
  };
  saveSettings(defaults);
  return defaults;
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function generate12DigitUTR(): string {
  const prefix = '423';
  const rest = Math.floor(100000000 + Math.random() * 900000000).toString();
  return prefix + rest;
}
