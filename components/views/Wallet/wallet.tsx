'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import moment from 'jalali-moment';
import {
  WalletIcon, ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, ArrowRightIcon,
  Loader2, ReceiptIcon, Info,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { useToast } from '@/hooks/use-toast';
import { API } from '@/services/const';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, Btn, Stat, EmptyState, Modal, Field, Shimmer } from '@/components/ui/kit';

interface Transaction {
  _id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  reference: string | null;
  createdAt: string;
}

const STATUS: Record<Transaction['status'], { label: string; color: string }> = {
  pending: { label: 'در انتظار تأیید', color: C.statusWarn },
  completed: { label: 'انجام شد', color: C.statusOk },
  failed: { label: 'ناموفق', color: C.statusDanger },
};

const TYPE_LABEL: Record<string, string> = {
  deposit: 'واریز',
  withdrawal: 'برداشت',
  transfer: 'انتقال',
};

/**
 * کیف پول.
 *
 * The old screen led with a grid of six "services" (mobile top-up, bus tickets,
 * bills) that were buttons with no handler — nothing behind any of them. They
 * are gone: the balance, what produced it and how to get it out is the whole
 * job of this page.
 */
export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { getWalletInfo(); }, []);

  const getWalletInfo = () => {
    setLoading(true);
    axiosService({ url: API.GET_WALLET, method: 'get', token: Cookies.get('auth_token') })
      .then((res) => {
        setBalance(res?.data?.wallet?.balance || 0);
        setTransactions(res?.data?.wallet?.transactions || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'دریافت اطلاعات کیف پول انجام نشد.' });
        setLoading(false);
      });
  };

  // The field shows a grouped Persian number; the request needs the integer.
  const amountValue = Number(withdrawalAmount.replace(/[^\d]/g, '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d۰-۹]/g, '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    setWithdrawalAmount(raw ? Number(raw).toLocaleString('fa-IR') : '');
  };

  const handleWithdraw = () => {
    if (!amountValue || amountValue <= 0) {
      toast({ variant: 'destructive', title: 'خطا', description: 'مبلغ معتبر وارد کنید.' });
      return;
    }
    if (amountValue > balance) {
      toast({ variant: 'destructive', title: 'خطا', description: 'موجودی کافی نیست.' });
      return;
    }

    setWithdrawalLoading(true);
    axiosService({
      url: API.ADD_TRANSACTION_WALLET,
      method: 'post',
      token: Cookies.get('auth_token'),
      body: { amount: amountValue, type: 'withdrawal' },
    })
      .then(() => {
        toast({ variant: 'success', title: 'ثبت شد', description: 'درخواست برداشت ثبت شد.' });
        setIsWithdrawModalOpen(false);
        setWithdrawalAmount('');
        getWalletInfo();
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'برداشت انجام نشد؛ دوباره تلاش کنید.' });
      })
      .finally(() => setWithdrawalLoading(false));
  };

  const formatDate = (date: string) =>
    moment(date).locale('fa').format('YYYY/MM/DD - HH:mm').replace(/\d/g, (m) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(m, 10)]);

  const deposits = transactions.filter((t) => t.type === 'deposit').reduce((s, t) => s + (t.amount || 0), 0);
  const withdrawals = transactions.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <>
      <Screen>
        <Hero
          icon={<WalletIcon className="h-6 w-6" />}
          title="کیف پول"
          sub="هر جمع‌آوری پس از توزین، به‌صورت اعتبار همین‌جا می‌نشیند."
          aside={
            <div style={{ textAlign: 'start' }}>
              <p style={{ margin: 0, fontSize: S.xs, color: C.onHeroMuted, fontWeight: 600 }}>موجودی قابل برداشت</p>
              <p className="tnum" style={{ margin: '6px 0 0', fontSize: S.xl, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {loading ? '…' : fa(balance)}
                <span style={{ fontSize: S.xs, fontWeight: 600, marginInlineStart: 5, color: C.onHeroMuted }}>تومان</span>
              </p>
            </div>
          }
        />

        <Btn full onClick={() => setIsWithdrawModalOpen(true)} disabled={loading || balance <= 0}>
          <ArrowRightIcon className="h-4 w-4" />
          درخواست برداشت
        </Btn>

        <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginTop: S.s4 }}>
          <Stat label="مجموع واریزها" value={fa(deposits)} unit="تومان" icon={<ArrowDownIcon className="h-4 w-4" />} color={C.green} />
          <Stat label="مجموع برداشت‌ها" value={fa(withdrawals)} unit="تومان" icon={<ArrowUpIcon className="h-4 w-4" />} color={C.statusDanger} />
          <Stat label="تراکنش موفق" value={fa(transactions.filter((t) => t.status === 'completed').length)} unit="مورد" icon={<TrendingUpIcon className="h-4 w-4" />} color={C.statusInfo} />
        </div>

        <p style={{ margin: `${S.s6}px 0 ${S.s3}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>تاریخچهٔ تراکنش‌ها</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {[0, 1, 2].map((i) => <Shimmer key={i} height={74} />)}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="h-6 w-6" />}
            title="هنوز تراکنشی ندارید"
            sub="پس از اولین جمع‌آوری و توزین، مبلغ آن این‌جا ثبت می‌شود."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {transactions.map((t, i) => {
              const isIn = t.type === 'deposit';
              const color = isIn ? C.green : t.type === 'withdrawal' ? C.statusDanger : C.statusWarn;
              const status = STATUS[t.status];
              return (
                <div key={t._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                  <Card>
                    <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                      <IconBadge color={color} size={38}>
                        {isIn ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}
                      </IconBadge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                          {TYPE_LABEL[t.reference || t.type] || TYPE_LABEL[t.type]}
                        </p>
                        <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>{formatDate(t.createdAt)}</p>
                      </div>
                      <div style={{ textAlign: 'start', flexShrink: 0 }}>
                        <p className="tnum" style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color, whiteSpace: 'nowrap' }}>
                          {isIn ? '+' : '−'} {fa(t.amount)}
                        </p>
                        <span
                          style={{
                            display: 'inline-block', marginTop: 5, fontSize: 10, fontWeight: 700,
                            padding: '2px 8px', borderRadius: S.rPill,
                            background: alpha(status.color, 12), color: status.color,
                            border: `1px solid ${alpha(status.color, 24)}`,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      {isWithdrawModalOpen && (
        <Modal onClose={() => setIsWithdrawModalOpen(false)}>
          <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
            <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>برداشت از کیف پول</p>

            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${S.s3}px`, borderRadius: S.r2, background: C.surface2, border: `1px solid ${C.border}`,
              }}
            >
              <span style={{ fontSize: S.xs, color: C.muted, fontWeight: 600 }}>موجودی فعلی</span>
              <span className="tnum" style={{ fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{fa(balance)} تومان</span>
            </div>

            <Field label="مبلغ برداشت (تومان)">
              <input
                className="pm-field tnum"
                inputMode="numeric"
                value={withdrawalAmount}
                onChange={handleAmountChange}
                placeholder="۰"
              />
            </Field>

            <div style={{ display: 'flex', gap: 7 }}>
              {[25, 50, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setWithdrawalAmount(Math.floor((balance * p) / 100).toLocaleString('fa-IR'))}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: S.r1, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: S.xs, fontWeight: 800,
                    background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
                  }}
                >
                  {p === 100 ? 'همه' : `${fa(p)}٪`}
                </button>
              ))}
            </div>

            <p
              style={{
                margin: 0, display: 'flex', gap: 7, padding: `${S.s3}px`, borderRadius: S.r1,
                background: alpha(C.amber, 10), border: `1px solid ${alpha(C.amber, 20)}`,
                fontSize: S.xs, color: C.text, lineHeight: 1.9,
              }}
            >
              <Info className="h-4 w-4" style={{ flexShrink: 0, color: C.amber, marginTop: 2 }} />
              واریز به حساب شما بین ۱ تا ۲۴ ساعت کاری زمان می‌برد.
            </p>

            <div style={{ display: 'flex', gap: S.s2 }}>
              <Btn full onClick={handleWithdraw} disabled={withdrawalLoading || !amountValue || amountValue > balance}>
                {withdrawalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                تأیید برداشت
              </Btn>
              <Btn variant="ghost" onClick={() => setIsWithdrawModalOpen(false)}>انصراف</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
