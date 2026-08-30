'use client';

import React, { useEffect, useMemo, useState } from 'react';
import moment from 'jalali-moment';
import {
  ArrowDownIcon, ArrowUpIcon, BanknoteIcon, CheckCircle2, Clock, Copy, Loader2,
  LockKeyhole, ShieldCheck, Trash2, XCircle,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Btn, Card, Field, IconBadge, Modal } from '@/components/ui/kit';
import type { BankAccount, Contribution, WalletData, WalletTransaction } from './api';
import { errText, walletApi } from './api';

/**
 * The pieces the wallet screen is assembled from.
 *
 * Every sheet that moves money follows the same shape on purpose: what it will
 * cost, where it is going, the PIN if one is set, and one button that says what
 * will happen. A person confirming a payment should be reading a sentence, not
 * decoding a form.
 */

/* ── numbers ─────────────────────────────────────────────────────────────── */

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';

/** Persian or Arabic digits in, plain digits out — phones type both. */
export const digits = (value: string) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\D/g, '');

export const toman = (n: number) => `${fa(n)} تومان`;

export const jalali = (date: string) =>
  moment(date).locale('fa').format('YYYY/MM/DD - HH:mm').replace(/\d/g, (m) => PERSIAN[Number(m)]);

/* ── status vocabulary ───────────────────────────────────────────────────── */

export const TX_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'در انتظار تسویه', color: C.statusWarn },
  completed: { label: 'انجام شد', color: C.statusOk },
  failed: { label: 'ناموفق', color: C.statusDanger },
  canceled: { label: 'لغو شد', color: C.statusNeutral },
  rejected: { label: 'رد شد', color: C.statusDanger },
};

export const ACCOUNT_STATUS: Record<BankAccount['status'], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'در انتظار تأیید', color: C.statusWarn, icon: <Clock className="h-3.5 w-3.5" /> },
  verified: { label: 'تأیید شده', color: C.statusOk, icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  rejected: { label: 'تأیید نشد', color: C.statusDanger, icon: <XCircle className="h-3.5 w-3.5" /> },
};

export function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
        fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: S.rPill,
        background: alpha(color, 12), color, border: `1px solid ${alpha(color, 24)}`,
      }}
    >
      {children}
    </span>
  );
}

export function Note({ color = C.amber, children }: { color?: string; children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0, display: 'flex', gap: 7, padding: S.s3, borderRadius: S.r1,
        background: alpha(color, 10), border: `1px solid ${alpha(color, 20)}`,
        fontSize: S.xs, color: C.text, lineHeight: 1.9,
      }}
    >
      {children}
    </p>
  );
}

/* ── inputs ──────────────────────────────────────────────────────────────── */

/**
 * An amount in تومان.
 *
 * Grouped as it is typed, because six digits without separators is unreadable
 * and reading it back is the only way a person catches an extra zero.
 */
export function AmountField({
  label, value, onChange, hint, max, quick,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  max?: number;
  quick?: number[];
}) {
  return (
    <div style={{ display: 'grid', gap: S.s2 }}>
      <Field label={label} hint={hint}>
        <input
          className="pm-field tnum"
          inputMode="numeric"
          value={value ? value.toLocaleString('fa-IR') : ''}
          onChange={(e) => onChange(Number(digits(e.target.value) || 0))}
          placeholder="۰"
        />
      </Field>

      {!!max && !!quick?.length && (
        <div style={{ display: 'flex', gap: 7 }}>
          {quick.map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => onChange(Math.floor((max * percent) / 100))}
              style={{
                flex: 1, padding: '9px 0', borderRadius: S.r1, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: S.xs, fontWeight: 800,
                background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
              }}
            >
              {percent === 100 ? 'همه' : `${fa(percent)}٪`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Shown only when the citizen has set a PIN; hidden entirely when they have not. */
export function PinField({ value, onChange, label = 'رمز کیف پول' }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <Field label={label} icon={<LockKeyhole className="h-4 w-4" style={{ color: C.muted }} />}>
      <input
        className="pm-field tnum"
        inputMode="numeric"
        type="password"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(digits(e.target.value))}
        placeholder="••••"
        style={{ letterSpacing: '0.4em' }}
      />
    </Field>
  );
}

/** The footer every sheet ends with. */
function SheetActions({ onClose, onConfirm, busy, disabled, label }: {
  onClose: () => void; onConfirm: () => void; busy?: boolean; disabled?: boolean; label: string;
}) {
  return (
    <div style={{ display: 'flex', gap: S.s2 }}>
      <Btn full onClick={onConfirm} disabled={busy || disabled}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {label}
      </Btn>
      <Btn variant="ghost" onClick={onClose}>انصراف</Btn>
    </div>
  );
}

function SheetTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>{children}</p>;
}

function SheetBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>{children}</div>;
}

/** Balance, held amount, whatever the sheet needs read back before confirming. */
function Readout({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3,
        padding: S.s3, borderRadius: S.r2, background: C.surface2, border: `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontSize: S.xs, color: C.muted, fontWeight: 600 }}>{label}</span>
      <span className="tnum" style={{ fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{value}</span>
    </div>
  );
}

/* ── bank accounts ───────────────────────────────────────────────────────── */

export function AccountRow({ account, onDefault, onDelete, busy }: {
  account: BankAccount;
  onDefault: () => void;
  onDelete: () => void;
  busy?: boolean;
}) {
  const status = ACCOUNT_STATUS[account.status];

  return (
    <Card>
      <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
        <IconBadge color={status.color} size={38}><BanknoteIcon className="h-4 w-4" /></IconBadge>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
              {account.bankName || 'حساب بانکی'}
            </p>
            <Pill color={status.color}>{status.icon}{status.label}</Pill>
            {account.isDefault && <Pill color={C.statusInfo}>پیش‌فرض</Pill>}
          </div>
          <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, direction: 'ltr', textAlign: 'start' }}>
            {account.ibanMasked}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: S.xs, color: C.subtle }}>{account.holderName}</p>
          {account.status === 'rejected' && account.rejectionReason && (
            <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.statusDanger, lineHeight: 1.7 }}>
              {account.rejectionReason}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {!account.isDefault && account.status === 'verified' && (
            <button
              type="button"
              onClick={onDefault}
              disabled={busy}
              style={{
                fontFamily: 'inherit', fontSize: 10, fontWeight: 800, padding: '5px 10px', borderRadius: S.rPill,
                cursor: 'pointer', background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
              }}
            >
              پیش‌فرض
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            aria-label="حذف حساب"
            style={{
              display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 10, cursor: 'pointer',
              background: alpha(C.statusDanger, 8), color: C.statusDanger, border: `1px solid ${alpha(C.statusDanger, 20)}`,
              marginInlineStart: 'auto',
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Adding an account, in two steps.
 *
 * The first types the numbers and watches the bank name appear under the field
 * — that is the confirmation that the digits are right, and it comes from the
 * same checksum the server will apply. The second reads the whole thing back
 * before it is submitted, because a شبا is 24 digits and nobody proofreads a
 * field they have already left.
 */
export function AccountSheet({ onClose, onSaved }: { onClose: () => void; onSaved: (message: string) => void }) {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [iban, setIban] = useState('');
  const [card, setCard] = useState('');
  const [holder, setHolder] = useState('');
  const [title, setTitle] = useState('');
  const [check, setCheck] = useState<{ bankName: string; valid: boolean; message: string } | null>(null);
  const [cardCheck, setCardCheck] = useState<{ bankName: string; valid: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Checked as it is typed, but only once it is long enough to be a شبا at all.
  useEffect(() => {
    if (iban.length < 24 && card.length < 16) { setCheck(null); setCardCheck(null); return undefined; }
    const timer = setTimeout(() => {
      walletApi.checkNumbers({ iban: iban || undefined, cardNumber: card || undefined })
        .then((res) => {
          setCheck(res.iban ? { bankName: res.iban.bankName, valid: res.iban.valid, message: res.iban.message } : null);
          setCardCheck(res.card ? { bankName: res.card.bankName, valid: res.card.valid, message: res.card.message } : null);
        })
        .catch(() => undefined);
    }, 350);
    return () => clearTimeout(timer);
  }, [iban, card]);

  const ready = iban.length === 24 && check?.valid && holder.trim().length >= 3 && (!card || cardCheck?.valid);

  const submit = () => {
    setBusy(true);
    setError('');
    walletApi.addAccount({ iban, cardNumber: card || undefined, holderName: holder.trim(), title: title.trim() })
      .then((res) => onSaved(res.message))
      .catch((e) => { setError(errText(e)); setStep('form'); })
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>{step === 'form' ? 'افزودن حساب بانکی' : 'تأیید اطلاعات حساب'}</SheetTitle>

        {step === 'form' ? (
          <>
            <Field
              label="شمارهٔ شبا"
              hint={
                check
                  ? check.valid
                    ? `${check.bankName || 'شبای معتبر'} ✓`
                    : check.message
                  : 'بدون IR وارد کنید — ۲۴ رقم.'
              }
            >
              <input
                className="pm-field tnum"
                inputMode="numeric"
                dir="ltr"
                maxLength={24}
                value={iban}
                onChange={(e) => setIban(digits(e.target.value).slice(0, 24))}
                placeholder="012000000000000000000000"
                style={{ textAlign: 'start' }}
              />
            </Field>

            <Field
              label="شمارهٔ کارت (اختیاری)"
              hint={cardCheck ? (cardCheck.valid ? `${cardCheck.bankName || 'کارت معتبر'} ✓` : cardCheck.message) : 'برای اطمینان از تطابق حساب.'}
            >
              <input
                className="pm-field tnum"
                inputMode="numeric"
                dir="ltr"
                maxLength={16}
                value={card}
                onChange={(e) => setCard(digits(e.target.value).slice(0, 16))}
                placeholder="6037991234567890"
                style={{ textAlign: 'start' }}
              />
            </Field>

            <Field label="نام و نام خانوادگی صاحب حساب" hint="باید دقیقاً با نام روی حساب یکی باشد.">
              <input className="pm-field" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="مثلاً مریم رضایی" />
            </Field>

            <Field label="نام دلخواه برای این حساب (اختیاری)">
              <input className="pm-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً حساب اصلی" maxLength={40} />
            </Field>

            {error && <Note color={C.statusDanger}>{error}</Note>}

            <SheetActions onClose={onClose} onConfirm={() => setStep('confirm')} disabled={!ready} label="ادامه" />
          </>
        ) : (
          <>
            <Readout label="بانک" value={check?.bankName || '—'} />
            <div
              style={{
                padding: S.s3, borderRadius: S.r2, background: C.surface2, border: `1px solid ${C.border}`,
                display: 'grid', gap: 6,
              }}
            >
              <span style={{ fontSize: S.xs, color: C.muted, fontWeight: 600 }}>شمارهٔ شبا</span>
              <span className="tnum" style={{ fontSize: S.sm, fontWeight: 800, color: C.textStrong, direction: 'ltr', textAlign: 'start', wordBreak: 'break-all' }}>
                {`IR${iban}`.replace(/(.{4})/g, '$1 ').trim()}
              </span>
            </div>
            <Readout label="صاحب حساب" value={holder} />

            <Note>
              <ShieldCheck className="h-4 w-4" style={{ flexShrink: 0, color: C.amber, marginTop: 2 }} />
              پس از ثبت، کارشناسان شهرشهر تطابق نام صاحب حساب را بررسی می‌کنند. برداشت پس از تأیید فعال می‌شود.
            </Note>

            <div style={{ display: 'flex', gap: S.s2 }}>
              <Btn full onClick={submit} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                ثبت حساب
              </Btn>
              <Btn variant="ghost" onClick={() => setStep('form')}>ویرایش</Btn>
            </div>
          </>
        )}
      </SheetBody>
    </Modal>
  );
}

/* ── moving money ────────────────────────────────────────────────────────── */

export function WithdrawSheet({ wallet, onClose, onDone }: {
  wallet: WalletData;
  onClose: () => void;
  onDone: (message: string, wallet: WalletData) => void;
}) {
  const verified = useMemo(() => wallet.bankAccounts.filter((a) => a.status === 'verified'), [wallet.bankAccounts]);
  const [accountId, setAccountId] = useState(() => (verified.find((a) => a.isDefault) || verified[0])?._id || '');
  const [amount, setAmount] = useState(0);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    setBusy(true);
    setError('');
    walletApi.withdraw({ amount, bankAccountId: accountId, pin: pin || undefined })
      .then((res) => onDone(res.message, res.wallet))
      .catch((e) => setError(errText(e)))
      .finally(() => setBusy(false));
  };

  const tooSmall = amount > 0 && amount < wallet.limits.minWithdrawal;
  const tooBig = amount > wallet.balance;

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>برداشت از کیف پول</SheetTitle>

        <Readout label="موجودی قابل برداشت" value={toman(wallet.balance)} />

        {!verified.length ? (
          <Note color={C.statusDanger}>
            برای برداشت، ابتدا یک حساب بانکی ثبت کنید و منتظر تأیید آن بمانید.
          </Note>
        ) : (
          <Field label="واریز به حساب">
            <select className="pm-field" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {verified.map((a) => (
                <option key={a._id} value={a._id}>
                  {`${a.bankName || 'حساب'} — ${a.ibanMasked}`}
                </option>
              ))}
            </select>
          </Field>
        )}

        <AmountField
          label="مبلغ برداشت (تومان)"
          value={amount}
          onChange={setAmount}
          max={wallet.balance}
          quick={[25, 50, 100]}
          hint={`حداقل ${toman(wallet.limits.minWithdrawal)} — سقف ۲۴ ساعت ${toman(wallet.limits.dailyWithdrawal)}`}
        />

        {wallet.hasPin && <PinField value={pin} onChange={setPin} />}

        {(tooSmall || tooBig || error) && (
          <Note color={C.statusDanger}>
            {error || (tooBig ? 'مبلغ از موجودی بیشتر است.' : `حداقل مبلغ برداشت ${toman(wallet.limits.minWithdrawal)} است.`)}
          </Note>
        )}

        <Note>
          <Clock className="h-4 w-4" style={{ flexShrink: 0, color: C.amber, marginTop: 2 }} />
          مبلغ بلافاصله از موجودی کسر و پس از بررسی، طی ۱ تا ۲۴ ساعت کاری به حسابتان واریز می‌شود. تا زمان تسویه می‌توانید درخواست را لغو کنید.
        </Note>

        <SheetActions
          onClose={onClose}
          onConfirm={submit}
          busy={busy}
          disabled={!verified.length || !amount || tooSmall || tooBig || (wallet.hasPin && pin.length < 4)}
          label="ثبت درخواست برداشت"
        />
      </SheetBody>
    </Modal>
  );
}

/**
 * Sending credit to another citizen.
 *
 * The recipient's name is fetched and shown before the amount is even asked
 * for: «۰۹۱۲…» is not something anyone can proofread, and a name is.
 */
export function TransferSheet({ wallet, onClose, onDone }: {
  wallet: WalletData;
  onClose: () => void;
  onDone: (message: string, wallet: WalletData) => void;
}) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [target, setTarget] = useState<{ name: string; phone: string } | null>(null);
  const [looking, setLooking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTarget(null);
    if (phone.length !== 11) return undefined;
    setLooking(true);
    const timer = setTimeout(() => {
      walletApi.lookup(phone)
        .then((res) => { setTarget({ name: res.name, phone: res.phone }); setError(''); })
        .catch((e) => setError(errText(e)))
        .finally(() => setLooking(false));
    }, 400);
    return () => { clearTimeout(timer); setLooking(false); };
  }, [phone]);

  const submit = () => {
    setBusy(true);
    setError('');
    walletApi.transfer({ phone, amount, note: note || undefined, pin: pin || undefined })
      .then((res) => onDone(res.message, res.wallet))
      .catch((e) => setError(errText(e)))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>انتقال به کاربر دیگر</SheetTitle>

        <Readout label="موجودی شما" value={toman(wallet.balance)} />

        <Field label="شمارهٔ موبایل گیرنده" hint="گیرنده باید در شهرشهر ثبت‌نام کرده باشد.">
          <input
            className="pm-field tnum"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(digits(e.target.value).slice(0, 11))}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          />
        </Field>

        {looking && <p style={{ margin: 0, fontSize: S.xs, color: C.muted }}>در حال یافتن گیرنده…</p>}

        {target && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: S.s3, padding: S.s3, borderRadius: S.r2,
              background: alpha(C.green, 8), border: `1px solid ${alpha(C.green, 20)}`,
            }}
          >
            <IconBadge color={C.green} size={34}><CheckCircle2 className="h-4 w-4" /></IconBadge>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{target.name}</p>
              {/* A masked number is a run of digits and bullets: left to right, or
                  bidi rearranges the two halves into a different number. */}
              <p className="tnum" dir="ltr" style={{ margin: '2px 0 0', fontSize: S.xs, color: C.muted, textAlign: 'start' }}>
                {target.phone}
              </p>
            </div>
          </div>
        )}

        <AmountField
          label="مبلغ انتقال (تومان)"
          value={amount}
          onChange={setAmount}
          max={wallet.balance}
          quick={[25, 50, 100]}
          hint={`از ${toman(wallet.limits.minTransfer)} تا ${toman(wallet.limits.maxTransfer)}`}
        />

        <Field label="توضیح (اختیاری)">
          <input className="pm-field" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="مثلاً بابت سهم بازیافت" />
        </Field>

        {wallet.hasPin && <PinField value={pin} onChange={setPin} />}

        {error && <Note color={C.statusDanger}>{error}</Note>}

        <SheetActions
          onClose={onClose}
          onConfirm={submit}
          busy={busy}
          disabled={!target || !amount || amount > wallet.balance || (wallet.hasPin && pin.length < 4)}
          label={amount ? `انتقال ${toman(amount)}` : 'انتقال'}
        />
      </SheetBody>
    </Modal>
  );
}

export function TopupSheet({ wallet, enabled, onClose }: { wallet: WalletData; enabled: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    setBusy(true);
    setError('');
    walletApi.topup(amount, '/wallet')
      .then((res) => { window.location.assign(res.url); })
      .catch((e) => { setError(errText(e)); setBusy(false); });
  };

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>شارژ کیف پول</SheetTitle>

        {!enabled ? (
          <>
            <Note color={C.statusInfo}>
              درگاه پرداخت این شهر هنوز فعال نشده است. تا آن زمان، اعتبار کیف پول از جمع‌آوری پسماند و انتقال از کاربران دیگر تأمین می‌شود.
            </Note>
            <Btn full variant="ghost" onClick={onClose}>بستن</Btn>
          </>
        ) : (
          <>
            <Readout label="موجودی فعلی" value={toman(wallet.balance)} />
            <AmountField
              label="مبلغ شارژ (تومان)"
              value={amount}
              onChange={setAmount}
              hint={`از ${toman(wallet.limits.minTopup)} تا ${toman(wallet.limits.maxTopup)}`}
            />
            <div style={{ display: 'flex', gap: 7 }}>
              {[100000, 200000, 500000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: S.r1, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: S.xs, fontWeight: 800,
                    background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
                  }}
                >
                  {fa(v)}
                </button>
              ))}
            </div>
            {error && <Note color={C.statusDanger}>{error}</Note>}
            <SheetActions onClose={onClose} onConfirm={submit} busy={busy} disabled={!amount} label="پرداخت از درگاه بانکی" />
          </>
        )}
      </SheetBody>
    </Modal>
  );
}

export function ContributeSheet({ wallet, causes, onClose, onDone }: {
  wallet: WalletData;
  causes: Contribution[];
  onClose: () => void;
  onDone: (message: string, wallet: WalletData) => void;
}) {
  const [cause, setCause] = useState(causes[0]?.key || '');
  const [amount, setAmount] = useState(0);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    setBusy(true);
    setError('');
    walletApi.contribute({ amount, cause, pin: pin || undefined })
      .then((res) => onDone(res.message, res.wallet))
      .catch((e) => setError(errText(e)))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>اختصاص اعتبار به طرح‌های شهر</SheetTitle>

        <div style={{ display: 'grid', gap: S.s2 }}>
          {causes.map((c) => {
            const on = c.key === cause;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCause(c.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: S.s3, textAlign: 'start', cursor: 'pointer',
                  padding: S.s3, borderRadius: S.r2, fontFamily: 'inherit',
                  background: on ? alpha(C.green, 10) : C.surface2,
                  border: `1px solid ${on ? alpha(C.green, 30) : C.border}`,
                  color: C.textStrong, fontSize: S.sm, fontWeight: on ? 800 : 600,
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                {c.title}
              </button>
            );
          })}
        </div>

        <AmountField label="مبلغ (تومان)" value={amount} onChange={setAmount} max={wallet.balance} quick={[25, 50]} />

        {wallet.hasPin && <PinField value={pin} onChange={setPin} />}
        {error && <Note color={C.statusDanger}>{error}</Note>}

        <SheetActions
          onClose={onClose}
          onConfirm={submit}
          busy={busy}
          disabled={!amount || amount > wallet.balance || !cause || (wallet.hasPin && pin.length < 4)}
          label="اختصاص اعتبار"
        />
      </SheetBody>
    </Modal>
  );
}

/* ── settings ────────────────────────────────────────────────────────────── */

export function PinSheet({ wallet, onClose, onDone }: {
  wallet: WalletData;
  onClose: () => void;
  onDone: (message: string, wallet: WalletData) => void;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = () => {
    if (next !== repeat) { setError('تکرار رمز یکسان نیست.'); return; }
    setBusy(true);
    setError('');
    walletApi.setPin({ pin: next, currentPin: current || undefined })
      .then((res) => onDone(res.message, res.wallet))
      .catch((e) => setError(errText(e)))
      .finally(() => setBusy(false));
  };

  const remove = () => {
    setBusy(true);
    setError('');
    walletApi.removePin(current)
      .then((res) => onDone(res.message, res.wallet))
      .catch((e) => setError(errText(e)))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>{wallet.hasPin ? 'تغییر رمز کیف پول' : 'تنظیم رمز کیف پول'}</SheetTitle>

        <Note color={C.statusInfo}>
          با تنظیم رمز، برای هر برداشت، انتقال یا پرداخت از کیف پول، این رمز پرسیده می‌شود.
        </Note>

        {wallet.hasPin && <PinField label="رمز فعلی" value={current} onChange={setCurrent} />}
        <PinField label="رمز جدید (۴ تا ۶ رقم)" value={next} onChange={(v) => setNext(v.slice(0, 6))} />
        <PinField label="تکرار رمز جدید" value={repeat} onChange={(v) => setRepeat(v.slice(0, 6))} />

        {error && <Note color={C.statusDanger}>{error}</Note>}

        <div style={{ display: 'flex', gap: S.s2 }}>
          <Btn full onClick={save} disabled={busy || next.length < 4 || (wallet.hasPin && current.length < 4)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            ذخیرهٔ رمز
          </Btn>
          {wallet.hasPin && (
            <Btn variant="ghost" onClick={remove} disabled={busy || current.length < 4}>حذف رمز</Btn>
          )}
        </div>
      </SheetBody>
    </Modal>
  );
}

export function AutoSettleSheet({ wallet, onClose, onDone }: {
  wallet: WalletData;
  onClose: () => void;
  onDone: (message: string, wallet: WalletData) => void;
}) {
  const [threshold, setThreshold] = useState(wallet.settings.autoSettleThreshold || wallet.limits.minWithdrawal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = (autoSettle: boolean) => {
    setBusy(true);
    setError('');
    walletApi.settings({ autoSettle, autoSettleThreshold: threshold })
      .then((res) => onDone(res.message, res.wallet))
      .catch((e) => setError(errText(e)))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose}>
      <SheetBody>
        <SheetTitle>تسویهٔ خودکار</SheetTitle>

        <Note color={C.statusInfo}>
          هر بار که موجودی شما به این مبلغ برسد، درخواست برداشت به حساب پیش‌فرض به‌صورت خودکار ثبت می‌شود.
        </Note>

        <AmountField
          label="آستانهٔ تسویه (تومان)"
          value={threshold}
          onChange={setThreshold}
          hint={`حداقل ${toman(wallet.limits.minWithdrawal)}`}
        />

        {error && <Note color={C.statusDanger}>{error}</Note>}

        <div style={{ display: 'flex', gap: S.s2 }}>
          <Btn full onClick={() => save(true)} disabled={busy || threshold < wallet.limits.minWithdrawal}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {wallet.settings.autoSettle ? 'ذخیرهٔ تغییرات' : 'فعال‌سازی'}
          </Btn>
          {wallet.settings.autoSettle && <Btn variant="ghost" onClick={() => save(false)} disabled={busy}>غیرفعال</Btn>}
        </div>
      </SheetBody>
    </Modal>
  );
}

/* ── the statement ───────────────────────────────────────────────────────── */

export function TransactionRow({ transaction, onClick }: { transaction: WalletTransaction; onClick: () => void }) {
  const status = TX_STATUS[transaction.status] || TX_STATUS.pending;
  const isIn = transaction.direction === 'in';
  const color = isIn ? C.green : transaction.status === 'completed' ? C.statusDanger : C.statusWarn;

  return (
    <Card onClick={onClick}>
      <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
        <IconBadge color={color} size={38}>
          {isIn ? <ArrowDownIcon className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}
        </IconBadge>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {transaction.title}
          </p>
          <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>{jalali(transaction.createdAt)}</p>
        </div>

        <div style={{ textAlign: 'start', flexShrink: 0 }}>
          <p className="tnum" style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color, whiteSpace: 'nowrap' }}>
            {isIn ? '+' : '−'} {fa(transaction.amount)}
          </p>
          <span style={{ display: 'inline-block', marginTop: 5 }}>
            <Pill color={status.color}>{status.label}</Pill>
          </span>
        </div>
      </div>
    </Card>
  );
}

/**
 * The receipt.
 *
 * Everything the ledger knows about one movement, including the balance it left
 * behind and the bank's tracking code — the two things a citizen is asked for
 * when they call support about money that has not arrived.
 */
export function ReceiptSheet({ transaction, onClose, onCancel, canceling }: {
  transaction: WalletTransaction;
  onClose: () => void;
  onCancel?: () => void;
  canceling?: boolean;
}) {
  const status = TX_STATUS[transaction.status] || TX_STATUS.pending;
  const [copied, setCopied] = useState('');

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(''), 1500);
    }).catch(() => undefined);
  };

  const rows: { label: string; value: string; copyable?: boolean }[] = [
    { label: 'وضعیت', value: status.label },
    { label: 'تاریخ', value: jalali(transaction.createdAt) },
    ...(transaction.balanceAfter !== undefined && transaction.balanceAfter !== null
      ? [{ label: 'موجودی پس از تراکنش', value: toman(transaction.balanceAfter) }] : []),
    ...(transaction.bankAccount?.bankName ? [{ label: 'بانک مقصد', value: transaction.bankAccount.bankName }] : []),
    ...(transaction.bankAccount?.iban ? [{ label: 'شبا', value: transaction.bankAccount.iban }] : []),
    ...(transaction.counterparty?.name ? [{ label: 'طرف تراکنش', value: `${transaction.counterparty.name} (${transaction.counterparty.phone})` }] : []),
    ...(transaction.trackingCode ? [{ label: 'کد پیگیری', value: transaction.trackingCode, copyable: true }] : []),
    ...(transaction.description ? [{ label: 'توضیح', value: transaction.description }] : []),
    ...(transaction.rejectionReason ? [{ label: 'دلیل رد', value: transaction.rejectionReason }] : []),
    { label: 'شناسهٔ تراکنش', value: transaction._id, copyable: true },
  ];

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: S.s2, textAlign: 'center' }}>
          <IconBadge color={transaction.direction === 'in' ? C.green : C.statusDanger} size={54}>
            {transaction.direction === 'in' ? <ArrowDownIcon className="h-5 w-5" /> : <ArrowUpIcon className="h-5 w-5" />}
          </IconBadge>
          <p style={{ margin: 0, fontSize: S.sm, color: C.muted, fontWeight: 600 }}>{transaction.title}</p>
          <p className="tnum" style={{ margin: 0, fontSize: S.xl, fontWeight: 800, color: C.textStrong }}>
            {transaction.direction === 'in' ? '+' : '−'} {toman(transaction.amount)}
          </p>
          <Pill color={status.color}>{status.label}</Pill>
        </div>

        <div style={{ display: 'grid', gap: 1, background: C.border, borderRadius: S.r2, overflow: 'hidden' }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3,
                padding: `10px ${S.s3}px`, background: C.surface,
              }}
            >
              <span style={{ fontSize: S.xs, color: C.muted, fontWeight: 600, flexShrink: 0 }}>{row.label}</span>
              <span
                className="tnum"
                // Identifiers and account numbers are left-to-right runs; letting
                // them inherit the page direction breaks them into the wrong order.
                dir={row.copyable || row.label === 'شبا' ? 'ltr' : undefined}
                style={{ fontSize: S.xs, color: C.text, fontWeight: 700, textAlign: 'end', minWidth: 0, wordBreak: 'break-all' }}
              >
                {row.value}
                {row.copyable && (
                  <button
                    type="button"
                    onClick={() => copy(row.value)}
                    aria-label="کپی"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.green, marginInlineStart: 6, verticalAlign: 'middle' }}
                  >
                    {copied === row.value ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        {transaction.type === 'withdrawal' && transaction.status === 'pending' && onCancel && (
          <Btn full variant="ghost" onClick={onCancel} disabled={canceling}>
            {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            لغو درخواست برداشت
          </Btn>
        )}

        <Btn full onClick={onClose}>بستن</Btn>
      </div>
    </Modal>
  );
}
