export interface BankAccount {
  id: string;
  bankName: string;
  bankLogo: string;
  accountNumberMasked: string;
  accountType: 'Savings' | 'Current' | 'Salary';
  balance: number;
  isPrimary: boolean;
  ifsc: string;
  upiPinLength: 4 | 6;
  correctPin: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  upiId: string;
  avatar: string;
  initials: string;
  isRecent?: boolean;
  isFavorite?: boolean;
  lastPaidDate?: string;
  lastAmount?: number;
}

export type TransactionType = 'DEBIT' | 'CREDIT';
export type TransactionCategory = 'TRANSFER' | 'MERCHANT' | 'BILLS' | 'RECHARGE' | 'CASHBACK' | 'FOOD' | 'GROCERY' | 'TRAVEL' | 'ENTERTAINMENT';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string;
  utr: string; // 12-digit UPI reference number
  title: string;
  recipientVpa: string;
  senderVpa: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  timestamp: string; // ISO string
  status: TransactionStatus;
  bankUsed: string; // e.g. "HDFC Bank XX4092" or "UPI Lite"
  note?: string;
  scratchCardEarned?: boolean;
  scratchCardId?: string;
  billerDetails?: {
    operator: string;
    consumerId: string;
    billNumber?: string;
  };
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  brand: string;
  brandColor: string;
  logo: string;
  discountCode?: string;
  cashbackAmount?: number;
  isScratched: boolean;
  expiresAt: string;
  type: 'CASHBACK' | 'VOUCHER';
}

export interface BillerCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  operators: {
    id: string;
    name: string;
    logo: string;
    sampleBillAmount: number;
    accountLabel: string;
  }[];
}

export interface SplitMember {
  id: string;
  name: string;
  phone: string;
  amount: number;
  isPaid: boolean;
}

export interface SplitGroup {
  id: string;
  title: string;
  totalAmount: number;
  createdAt: string;
  members: SplitMember[];
}
