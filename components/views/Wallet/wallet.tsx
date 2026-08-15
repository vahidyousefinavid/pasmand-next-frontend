'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownIcon, ArrowLeftRight, ArrowUpIcon, BanknoteIcon, HeartHandshake, Loader2,
  LockKeyhole, PlusCircle, ReceiptIcon, Repeat, SearchIcon, TrendingUpIcon, WalletIcon,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Btn, Card, EmptyState, Hero, IconBadge, Screen, SectionTitle, Segmented, Shimmer, Stat } from '@/components/ui/kit';

import type { Contribution, WalletData, WalletTransaction } from './api';
import { errText, walletApi } from './api';
import {
  AccountRow, AccountSheet, AutoSettleSheet, ContributeSheet, Note, Pill, PinSheet, ReceiptSheet,
  TopupSheet, TransactionRow, TransferSheet, WithdrawSheet, toman,
} from './parts';

/**
 * کیف پول.
 *
 * The screen is ordered by what a citizen came here to find out, in order: what
 * they have, what they can do with it, where it will be paid, and what happened
 * before. Everything that moves money opens a sheet that reads back what is
 * about to happen — this is the one screen in the app where a mis-tap costs
 * something.
 *
 * The withdrawal it used to offer went nowhere in particular: there was no
 * account to pay into, so «واریز به حساب شما» named a destination the system
 * did not have. That is what the accounts section is.
 */

type Sheet = 'withdraw' | 'transfer' | 'topup' | 'contribute' | 'account' | 'pin' | 'autosettle' | null;
type Filter = 'all' | 'in' | 'out';

const PAGE = 15;

export default function WalletPage() {
  const { toast } = useToast();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [causes, setCauses] = useState<Contribution[]>([]);
  const [gatewayOn, setGatewayOn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [receipt, setReceipt] = useState<WalletTransaction | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [busyAccount, setBusyAccount] = useState('');

  const [rows, setRows] = useState<WalletTransaction[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const say = (message: string, bad = false) =>
    toast({ variant: bad ? 'destructive' : 'success', title: bad ? 'ناموفق' : 'انجام شد', description: message });

  /* ── loading ───────────────────────────────────────────────────────────── */

  const load = useCallback(() => {
    walletApi.get()
      .then((res) => {
        setWallet(res.wallet);
        setCauses(res.contributions || []);
        setGatewayOn(!!res.gateway?.enabled);
      })
      .catch(() => toast({ variant: 'destructive', title: 'ناموفق', description: 'دریافت اطلاعات کیف پول انجام نشد.' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  // The statement is its own request so filtering and paging do not re-read the
  // whole wallet, and so a long history never arrives with the balance.
  const loadRows = useCallback((nextPage: number, replace: boolean) => {
    setListLoading(true);
    walletApi.transactions({ page: nextPage, pageSize: PAGE, type: filter === 'all' ? undefined : filter, q: query || undefined })
      .then((res) => {
        setRows((current) => (replace ? res.results : [...current, ...res.results]));
        setTotal(res.info.filteredCount);
        setPage(nextPage);
      })
      .catch(() => undefined)
      .finally(() => setListLoading(false));
  }, [filter, query]);

  // Debounced, because this also runs on every keystroke in the search field.
  useEffect(() => {
    const timer = setTimeout(() => loadRows(0, true), 300);
    return () => clearTimeout(timer);
  }, [loadRows]);

  /**
   * Coming back from the bank.
   *
   * The API verified the payment before it redirected here; this only reports
   * what happened and cleans the parameters out of the address bar so a reload
   * does not repeat the message.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('topup');
    if (!result) return;

    if (result === 'ok') say(`کیف پول شما ${toman(Number(params.get('amount') || 0))} شارژ شد.`);
    else say(params.get('reason') || 'پرداخت انجام نشد.', true);

    window.history.replaceState({}, '', '/wallet');
    load();
    // Runs once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const afterMove = (message: string, next: WalletData) => {
    setWallet(next);
    setSheet(null);
    say(message);
    loadRows(0, true);
  };

  /* ── accounts ──────────────────────────────────────────────────────────── */

  const accountAction = (id: string, action: 'default' | 'delete') => {
    setBusyAccount(id);
    const request = action === 'default' ? walletApi.makeDefaultAccount(id) : walletApi.removeAccount(id);
    request
      .then((res: any) => { say(res.message); load(); })
      .catch((e) => say(errText(e), true))
      .finally(() => setBusyAccount(''));
  };

  const cancelWithdrawal = (id: string) => {
    setCanceling(true);
    walletApi.cancelWithdrawal(id)
      .then((res) => { setWallet(res.wallet); setReceipt(null); say(res.message); loadRows(0, true); })
      .catch((e) => say(errText(e), true))
      .finally(() => setCanceling(false));
  };

  /* ── render ────────────────────────────────────────────────────────────── */

  if (loading || !wallet) {
    return (
      <Screen>
        <Shimmer height={150} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2, marginTop: S.s4 }}>
          {[0, 1, 2].map((i) => <Shimmer key={i} height={74} />)}
        </div>
      </Screen>
    );
  }

  const verifiedAccounts = wallet.bankAccounts.filter((a) => a.status === 'verified');

  const actions = [
    { key: 'withdraw' as const, label: 'برداشت', icon: <ArrowUpIcon className="h-5 w-5" />, color: C.green, disabled: wallet.balance <= 0 },
    { key: 'transfer' as const, label: 'انتقال', icon: <ArrowLeftRight className="h-5 w-5" />, color: C.statusInfo, disabled: wallet.balance <= 0 },
    { key: 'topup' as const, label: 'شارژ', icon: <PlusCircle className="h-5 w-5" />, color: C.violet, disabled: false },
    { key: 'contribute' as const, label: 'کمک به شهر', icon: <HeartHandshake className="h-5 w-5" />, color: C.amber, disabled: wallet.balance <= 0 || !causes.length },
  ];

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
                {fa(wallet.balance)}
                <span style={{ fontSize: S.xs, fontWeight: 600, marginInlineStart: 5, color: C.onHeroMuted }}>تومان</span>
              </p>
              {wallet.held > 0 && (
                <p className="tnum" style={{ margin: '5px 0 0', fontSize: S.xs, color: C.onHeroMuted }}>
                  {fa(wallet.held)} تومان در انتظار تسویه
                </p>
              )}
            </div>
          }
        />

        {wallet.isFrozen && (
          <div style={{ marginBottom: S.s4 }}>
            <Note color={C.statusDanger}>
              کیف پول شما موقتاً مسدود است{wallet.frozenReason ? ` — ${wallet.frozenReason}` : ''}. برای پیگیری با پشتیبانی تماس بگیرید.
            </Note>
          </div>
        )}

        {/* ── what can be done with the balance ── */}
        <div style={{ display: 'grid', gap: S.s2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              disabled={action.disabled || wallet.isFrozen}
              onClick={() => setSheet(action.key)}
              style={{
                display: 'grid', justifyItems: 'center', gap: 7, padding: `${S.s3}px 4px`,
                borderRadius: S.r3, cursor: action.disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadowCard,
                opacity: action.disabled || wallet.isFrozen ? 0.45 : 1,
              }}
            >
              <IconBadge color={action.color} size={40}>{action.icon}</IconBadge>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.textStrong, textAlign: 'center' }}>{action.label}</span>
            </button>
          ))}
        </div>

        {/* ── where money is paid out ── */}
        <SectionTitle
          title="حساب‌های بانکی"
          action={
            wallet.bankAccounts.length < wallet.limits.maxBankAccounts ? (
              <button
                type="button"
                onClick={() => setSheet('account')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: S.xs, fontWeight: 800, padding: '7px 13px', borderRadius: S.rPill,
                  background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
                }}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                افزودن حساب
              </button>
            ) : undefined
          }
        />

        {wallet.bankAccounts.length === 0 ? (
          <EmptyState
            icon={<BanknoteIcon className="h-6 w-6" />}
            title="هنوز حسابی ثبت نکرده‌اید"
            sub="برای برداشت موجودی، شمارهٔ شبای حسابی به نام خودتان را ثبت کنید. پس از تأیید، برداشت فعال می‌شود."
            action={<Btn onClick={() => setSheet('account')}>ثبت حساب بانکی</Btn>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {wallet.bankAccounts.map((account) => (
              <AccountRow
                key={account._id}
                account={account}
                busy={busyAccount === account._id}
                onDefault={() => accountAction(account._id, 'default')}
                onDelete={() => accountAction(account._id, 'delete')}
              />
            ))}
          </div>
        )}

        {/* ── the numbers ── */}
        <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginTop: S.s5 }}>
          <Stat label="مجموع دریافتی‌ها" value={fa(wallet.totals.deposits)} unit="تومان" icon={<ArrowDownIcon className="h-4 w-4" />} color={C.green} />
          <Stat label="مجموع برداشت‌ها" value={fa(wallet.totals.withdrawals)} unit="تومان" icon={<ArrowUpIcon className="h-4 w-4" />} color={C.statusDanger} />
          <Stat label="تراکنش موفق" value={fa(wallet.totals.completed)} unit="مورد" icon={<TrendingUpIcon className="h-4 w-4" />} color={C.statusInfo} />
        </div>

        {/* ── the statement ── */}
        <SectionTitle title="تاریخچهٔ تراکنش‌ها" />

        <div style={{ display: 'grid', gap: S.s2, marginBottom: S.s3 }}>
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[{ value: 'all', label: 'همه' }, { value: 'in', label: 'دریافتی' }, { value: 'out', label: 'پرداختی' }]}
          />
          <div style={{ position: 'relative' }}>
            <SearchIcon
              className="h-4 w-4"
              style={{ position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }}
            />
            <input
              className="pm-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجو در عنوان، مبلغ یا کد پیگیری"
              style={{ paddingInlineStart: 40 }}
            />
          </div>
        </div>

        {listLoading && rows.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {[0, 1, 2].map((i) => <Shimmer key={i} height={74} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="h-6 w-6" />}
            title={query || filter !== 'all' ? 'تراکنشی با این فیلتر نیست' : 'هنوز تراکنشی ندارید'}
            sub={query || filter !== 'all' ? 'فیلتر را تغییر دهید.' : 'پس از اولین جمع‌آوری و توزین، مبلغ آن این‌جا ثبت می‌شود.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {rows.map((transaction, i) => (
              <div key={transaction._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                <TransactionRow transaction={transaction} onClick={() => setReceipt(transaction)} />
              </div>
            ))}

            {rows.length < total && (
              <Btn variant="soft" full onClick={() => loadRows(page + 1, false)} disabled={listLoading}>
                {listLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
                نمایش تراکنش‌های بیشتر
              </Btn>
            )}
          </div>
        )}

        {/* ── settings ── */}
        <SectionTitle title="تنظیمات کیف پول" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          <Card onClick={() => (verifiedAccounts.length ? setSheet('autosettle') : say('ابتدا یک حساب بانکی تأییدشده ثبت کنید.', true))}>
            <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
              <IconBadge color={C.green} size={38}><Repeat className="h-4 w-4" /></IconBadge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>تسویهٔ خودکار</p>
                <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>
                  {wallet.settings.autoSettle
                    ? `فعال — با رسیدن موجودی به ${toman(wallet.settings.autoSettleThreshold)} درخواست برداشت ثبت می‌شود.`
                    : 'با رسیدن موجودی به مبلغ دلخواه، برداشت خودکار ثبت شود.'}
                </p>
              </div>
              <Pill color={wallet.settings.autoSettle ? C.statusOk : C.statusNeutral}>
                {wallet.settings.autoSettle ? 'فعال' : 'غیرفعال'}
              </Pill>
            </div>
          </Card>

          <Card onClick={() => setSheet('pin')}>
            <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
              <IconBadge color={C.violet} size={38}><LockKeyhole className="h-4 w-4" /></IconBadge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>رمز کیف پول</p>
                <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>
                  {wallet.hasPin ? 'برای هر برداشت و انتقال پرسیده می‌شود.' : 'برداشت و انتقال را با یک رمز چهار رقمی محافظت کنید.'}
                </p>
              </div>
              <Pill color={wallet.hasPin ? C.statusOk : C.statusNeutral}>{wallet.hasPin ? 'فعال' : 'غیرفعال'}</Pill>
            </div>
          </Card>
        </div>
      </Screen>

      {/* ── sheets ── */}
      {sheet === 'account' && (
        <AccountSheet onClose={() => setSheet(null)} onSaved={(message) => { setSheet(null); say(message); load(); }} />
      )}
      {sheet === 'withdraw' && <WithdrawSheet wallet={wallet} onClose={() => setSheet(null)} onDone={afterMove} />}
      {sheet === 'transfer' && <TransferSheet wallet={wallet} onClose={() => setSheet(null)} onDone={afterMove} />}
      {sheet === 'topup' && <TopupSheet wallet={wallet} enabled={gatewayOn} onClose={() => setSheet(null)} />}
      {sheet === 'contribute' && <ContributeSheet wallet={wallet} causes={causes} onClose={() => setSheet(null)} onDone={afterMove} />}
      {sheet === 'pin' && <PinSheet wallet={wallet} onClose={() => setSheet(null)} onDone={(m, w) => { setWallet(w); setSheet(null); say(m); }} />}
      {sheet === 'autosettle' && (
        <AutoSettleSheet wallet={wallet} onClose={() => setSheet(null)} onDone={(m, w) => { setWallet(w); setSheet(null); say(m); }} />
      )}

      {receipt && (
        <ReceiptSheet
          transaction={receipt}
          canceling={canceling}
          onClose={() => setReceipt(null)}
          onCancel={() => cancelWithdrawal(receipt._id)}
        />
      )}
    </>
  );
}
