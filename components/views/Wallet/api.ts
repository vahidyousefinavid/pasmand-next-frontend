import Cookies from 'js-cookie';

import { axiosService } from '@/lib/axiosService';
import { API } from '@/services/const';

/**
 * The wallet's client.
 *
 * One place that knows the endpoints and the shapes, so the screen below is
 * about what a citizen sees rather than about request plumbing. Every call
 * carries the token the rest of the app uses.
 */

export type TransactionType =
  | 'deposit' | 'topup' | 'withdrawal' | 'transfer' | 'transfer_out'
  | 'transfer_in' | 'payment' | 'refund' | 'adjustment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'canceled' | 'rejected';

export interface WalletTransaction {
  _id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  direction: 'in' | 'out';
  title: string;
  description?: string;
  reference?: string;
  balanceAfter?: number;
  trackingCode?: string;
  rejectionReason?: string;
  createdAt: string;
  bankAccount?: { iban?: string; bankName?: string; holderName?: string };
  counterparty?: { name?: string; phone?: string };
  gateway?: { name?: string; refId?: string; cardPan?: string };
}

export interface BankAccount {
  _id: string;
  ibanMasked: string;
  ibanTail: string;
  cardMasked: string;
  holderName: string;
  bankName: string;
  title: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason: string;
  isDefault: boolean;
  createdAt: string;
  reviewedAt?: string;
}

export interface WalletLimits {
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyWithdrawal: number;
  maxPendingWithdrawals: number;
  minTransfer: number;
  maxTransfer: number;
  dailyTransfer: number;
  minTopup: number;
  maxTopup: number;
  minPayment: number;
  maxBankAccounts: number;
}

export interface WalletData {
  _id: string;
  balance: number;
  currency: string;
  /** Already claimed and waiting for a payout — not spendable. */
  held: number;
  isFrozen: boolean;
  frozenReason: string;
  hasPin: boolean;
  settings: { autoSettle: boolean; autoSettleThreshold: number };
  bankAccounts: BankAccount[];
  transactions: WalletTransaction[];
  transactionCount: number;
  limits: WalletLimits;
  totals: {
    deposits: number;
    withdrawals: number;
    completed: number;
    withdrawn24h: number;
    transferred24h: number;
  };
}

export interface Contribution { key: string; title: string; icon: string }

const token = () => Cookies.get('auth_token');

const call = <T = any>(url: string, method: 'get' | 'post' | 'put' | 'delete', body?: any, params?: object) =>
  axiosService<T>({ url, method, token: token(), body, params }).then((r) => r.data);

/** Whatever the API said went wrong, or a sentence that at least admits it. */
export const errText = (error: any): string =>
  error?.data?.message || error?.response?.data?.message || 'انجام نشد؛ دوباره تلاش کنید.';

export const walletApi = {
  get: () => call<{ wallet: WalletData; contributions: Contribution[]; gateway: { enabled: boolean } }>(API.WALLET.GET, 'get'),

  transactions: (params: { page?: number; pageSize?: number; type?: string; status?: string; q?: string }) =>
    call<{ results: WalletTransaction[]; info: { totalCount: number; filteredCount: number } }>(
      API.WALLET.TRANSACTIONS, 'get', undefined, params,
    ),

  checkNumbers: (body: { iban?: string; cardNumber?: string }) =>
    call<{
      iban?: { valid: boolean; message: string; bankName: string; display: string };
      card?: { valid: boolean; message: string; bankName: string };
    }>(API.WALLET.CHECK_ACCOUNT, 'post', body),

  addAccount: (body: { iban: string; cardNumber?: string; holderName: string; title?: string }) =>
    call<{ message: string; accounts: BankAccount[] }>(API.WALLET.ACCOUNTS, 'post', body),

  removeAccount: (id: string) => call(`${API.WALLET.ACCOUNTS}/${id}`, 'delete'),
  makeDefaultAccount: (id: string) => call(`${API.WALLET.ACCOUNTS}/${id}/default`, 'put'),

  withdraw: (body: { amount: number; bankAccountId?: string; pin?: string }) =>
    call<{ message: string; wallet: WalletData }>(API.WALLET.WITHDRAW, 'post', body),

  cancelWithdrawal: (id: string) => call<{ message: string; wallet: WalletData }>(`${API.WALLET.WITHDRAW}/${id}/cancel`, 'post'),

  lookup: (phone: string) => call<{ exists: boolean; name: string; phone: string }>(API.WALLET.LOOKUP, 'get', undefined, { phone }),

  transfer: (body: { phone: string; amount: number; note?: string; pin?: string }) =>
    call<{ message: string; wallet: WalletData }>(API.WALLET.TRANSFER, 'post', body),

  topup: (amount: number, returnTo = '/wallet') =>
    call<{ url: string; authority: string }>(API.WALLET.TOPUP, 'post', { amount, returnTo }),

  contribute: (body: { amount: number; cause: string; pin?: string }) =>
    call<{ message: string; wallet: WalletData }>(API.WALLET.CONTRIBUTE, 'post', body),

  settings: (body: { autoSettle?: boolean; autoSettleThreshold?: number }) =>
    call<{ message: string; wallet: WalletData }>(API.WALLET.SETTINGS, 'put', body),

  setPin: (body: { pin: string; currentPin?: string }) => call<{ message: string; wallet: WalletData }>(API.WALLET.PIN, 'post', body),
  removePin: (currentPin: string) => call<{ message: string; wallet: WalletData }>(API.WALLET.PIN, 'delete', { currentPin }),
};
