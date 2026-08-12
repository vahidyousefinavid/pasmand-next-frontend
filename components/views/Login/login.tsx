'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Phone, Building2, ChevronRight, Loader2, ShieldCheck, Check } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { API } from '@/services/const';
import { useAuth } from '@/context/auth-context';
import { useCity } from '@/context/data-context';
import { C, S, alpha } from '@/components/ui/tokens';
import { Card, Btn, StepRail, type Step } from '@/components/ui/kit';
import EcoGlobe from '@/components/ui/EcoGlobe';

/**
 * Sign in.
 *
 * One column, three states — city, phone, code — on the same rail the rest of
 * the app uses, so arriving at the wizard later is not a change of language.
 * The bottom sheet the old screen used is gone: it hid the current step behind
 * an extra tap and had two different chromes on one page.
 */

const STEPS: Step[] = [
  { key: 'city', title: 'انتخاب شهر' },
  { key: 'phone', title: 'شمارهٔ همراه' },
  { key: 'code', title: 'کد تأیید' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [verifyCodeStatus, setVerifyCodeStatus] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<number>();
  const [enteredCode, setEnteredCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCitySelect, setShowCitySelect] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  // Cities are whatever the panel currently offers, not a compiled-in list.
  const { cities } = useCity();

  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity');
    const savedPhone = localStorage.getItem('userPhone');
    if (savedCity && cities.find((c) => c.id === savedCity)) {
      setSelectedCity(savedCity);
      setShowCitySelect(false);
    }
    if (savedPhone) setPhone(savedPhone);
    // Depends on `cities`: the list arrives from the API after first paint, and
    // a saved city that is not in the list yet must not skip the picker.
  }, [cities]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer]);

  function generateFourDigitCode() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
    setVerifyCodeStatus(false);
    setEnteredCode(['', '', '', '']);
    setPhoneError(/^09\d{9}$/.test(value) || value === '' ? '' : 'شماره موبایل معتبر نیست');
  };

  const handleCodeChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...enteredCode];
      newCode[index] = value;
      setEnteredCode(newCode);
      if (value !== '' && index < 3) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !enteredCode[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleCitySelect = (id: string) => {
    setSelectedCity(id);
    localStorage.setItem('selectedCity', id);
    setShowCitySelect(false);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fresh = generateFourDigitCode();

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'text/plain');
    headers.append('x-api-key', 'OCk4VJJRyhujJ6CDiKPVIAap1WqJdiMehj5W5Lj27Vv8vK8H');

    fetch('https://api.sms.ir/v1/send/verify', {
      method: 'POST',
      headers,
      redirect: 'follow',
      body: JSON.stringify({
        mobile: phone,
        templateId: '256420',
        parameters: [{ name: 'code', value: fresh }],
      }),
    })
      .then((r) => r.text())
      .then(() => {
        setLoading(false);
        setCode(fresh);
        setVerifyCodeStatus(true);
        setIsTimerRunning(true);
        setTimer(90);
        toast({ variant: 'success', title: 'کد تأیید ارسال شد', description: 'کد چهاررقمی را وارد کنید.' });
      })
      .catch(() => {
        setLoading(false);
        toast({ variant: 'destructive', title: 'ارسال نشد', description: 'ارسال کد تأیید ناموفق بود؛ دوباره تلاش کنید.' });
      });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const combined = enteredCode.join('');
    setLoading(true);

    if (combined.length !== 4 || combined !== code?.toString()) {
      setLoading(false);
      toast({ variant: 'destructive', title: 'خطا', description: 'کد تأیید اشتباه است.' });
      return;
    }

    axios
      .post(API.SIGN_UP, { phone: `${phone}`, city: selectedCity })
      .then((res: any) => {
        setLoading(false);
        const token = res.data.token;
        Cookies.set('auth_token', token, { expires: 1 });
        localStorage.setItem('userPhone', phone);
        login({ id: res.data.id || '1', phone, token });
        toast({ variant: 'success', title: 'خوش آمدید', description: 'با موفقیت وارد شدید.' });
        router.push('/');
      })
      .catch(() => {
        setLoading(false);
        toast({ variant: 'destructive', title: 'ناموفق', description: 'ورود انجام نشد؛ دوباره تلاش کنید.' });
      });
  };

  const cityData = cities.find((c) => c.id === selectedCity);
  const step = showCitySelect ? 0 : verifyCodeStatus ? 2 : 1;

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: `radial-gradient(120% 80% at 50% 0%, ${alpha(C.green, 12)}, ${C.bg} 60%)`,
        color: C.text,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: `calc(${S.s6}px + env(safe-area-inset-top)) ${S.s4}px calc(${S.s6}px + env(safe-area-inset-bottom))`,
      }}
    >
      <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        {/* ── the mark ── */}
        <div style={{ display: 'grid', justifyItems: 'center', gap: S.s3 }}>
          <EcoGlobe size={210} />
          <h1 style={{ margin: 0, fontSize: S.xxl, fontWeight: 800, color: C.textStrong, letterSpacing: '-0.02em' }}>
            شهروند سبز
          </h1>
          <p style={{ margin: 0, fontSize: S.sm, color: C.muted, textAlign: 'center', lineHeight: 1.9, maxWidth: '34ch' }}>
            {cityData ? `سامانهٔ خدمات شهری ${cityData.name}` : 'خدمات شهری، از تلفن همراه تا درِ خانه.'}
          </p>
        </div>

        <Card>
          <div style={{ padding: `${S.s4}px` }}>
            <StepRail steps={STEPS} current={step} compact />
          </div>
        </Card>

        <Card accent={C.green}>
          <div style={{ padding: `${S.s5}px ${S.s4}px` }}>
            {/* ── city ── */}
            {showCitySelect ? (
              <div className="pm-fade-up">
                <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>شهر خود را انتخاب کنید</p>
                <p style={{ margin: `0 0 ${S.s4}px`, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                  درخواست‌های شما فقط در همین شهر بررسی می‌شود. بعداً هم می‌توانید تغییرش دهید.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCitySelect(city.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: S.s3, textAlign: 'start', cursor: 'pointer',
                        padding: `${S.s3}px`, borderRadius: S.r2, fontFamily: 'inherit',
                        background: C.surface2, border: `1.5px solid ${C.border}`, color: C.text,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={city.icon}
                        alt=""
                        width={40}
                        height={40}
                        style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: C.bgSubtle }}
                      />
                      <span style={{ flex: 1, minWidth: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{city.name}</span>
                      <Building2 className="h-4 w-4" style={{ color: C.subtle }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : !verifyCodeStatus ? (
              /* ── phone ── */
              <form className="pm-fade-up" onSubmit={handleSendCode}>
                <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>شمارهٔ همراه</p>
                <p style={{ margin: `0 0 ${S.s4}px`, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                  کد تأیید چهاررقمی به همین شماره پیامک می‌شود.
                </p>

                <div style={{ position: 'relative' }}>
                  <input
                    id="phone"
                    className="pm-field tnum"
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    disabled={loading}
                    onChange={handlePhoneChange}
                    style={{ paddingInlineEnd: 44, textAlign: 'left' }}
                    required
                  />
                  <Phone className="h-4 w-4" style={{ position: 'absolute', insetInlineEnd: 14, top: 16, color: C.subtle }} />
                </div>
                {phoneError && (
                  <p style={{ margin: `${S.s2}px 0 0`, fontSize: S.xs, color: C.statusDanger }}>{phoneError}</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2, marginTop: S.s4 }}>
                  <Btn type="submit" full disabled={loading || phone.length !== 11 || !!phoneError}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    ارسال کد تأیید
                  </Btn>
                  <Btn
                    variant="ghost"
                    full
                    onClick={() => {
                      setSelectedCity('');
                      localStorage.removeItem('selectedCity');
                      setShowCitySelect(true);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                    تغییر شهر {cityData ? `(${cityData.name})` : ''}
                  </Btn>
                </div>
              </form>
            ) : (
              /* ── code ── */
              <form className="pm-fade-up" onSubmit={handleVerifyCode}>
                <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>کد تأیید</p>
                <p style={{ margin: `0 0 ${S.s4}px`, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                  کد پیامک‌شده به <span className="tnum" dir="ltr">{phone}</span> را وارد کنید.
                </p>

                {/* Rendered right-to-left so the first box a Persian reader
                    reaches is digit one. */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: S.s2 }}>
                  {[3, 2, 1, 0].map((index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      className="pm-field tnum"
                      type="tel"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={enteredCode[index]}
                      onChange={(e) => handleCodeChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      disabled={loading}
                      style={{ width: 58, height: 62, textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, padding: 0 }}
                    />
                  ))}
                </div>

                {timer > 0 && (
                  <p className="tnum" style={{ margin: `${S.s3}px 0 0`, fontSize: S.xs, color: C.muted, textAlign: 'center' }}>
                    {formatTimer(timer)} تا دریافت دوبارهٔ کد
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2, marginTop: S.s4 }}>
                  <Btn type="submit" full disabled={loading || enteredCode.some((d) => !d)}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    تأیید و ورود
                  </Btn>
                  {timer === 0 && (
                    <Btn variant="soft" full disabled={loading} onClick={() => handleSendCode(new Event('submit') as any)}>
                      ارسال دوبارهٔ کد
                    </Btn>
                  )}
                  <Btn
                    variant="ghost"
                    full
                    onClick={() => {
                      setVerifyCodeStatus(false);
                      setEnteredCode(['', '', '', '']);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                    اصلاح شماره
                  </Btn>
                </div>
              </form>
            )}
          </div>
        </Card>

        <p style={{ margin: 0, fontSize: S.xs, color: C.subtle, textAlign: 'center', lineHeight: 1.9 }}>
          با ورود، شرایط استفاده از سامانهٔ خدمات شهری شهرشهر را می‌پذیرید.
        </p>
      </div>
    </div>
  );
}
