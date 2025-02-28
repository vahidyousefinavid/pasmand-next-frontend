'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';
import axios from "axios";
import { API } from '@/services/const';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [verifyCodeStatus, setVerifyCodeStatus] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<number>();
  const [enteredCode, setEnteredCode] = useState('');
  const [timer, setTimer] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // فقط عدد
    setPhone(value);
    setVerifyCodeStatus(false);
    setEnteredCode('');

    if (/^09\d{9}$/.test(value) || value === '') {
      setPhoneError('');
    } else {
      setPhoneError('شماره موبایل معتبر نیست');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log( e.target.value);
  
    const value = e.target.value.replace(/\D/g, ''); // حذف کاراکترهای غیر عددی
  
    if (value.length <= 4) {
      setEnteredCode(value);
    }
  
    if (value.length === 4) {
      setCodeError('');
    } else if (value.length > 0) {
      setCodeError('کد تایید باید ۴ رقم باشد');
    } else {
      setCodeError('');
    }
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    let code = generateFourDigitCode();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "text/plain");
    myHeaders.append("x-api-key", "OCk4VJJRyhujJ6CDiKPVIAap1WqJdiMehj5W5Lj27Vv8vK8H");

    var raw = JSON.stringify({
      "mobile": phone,
      "templateId": "256420",
      "parameters": [
        { name: 'code', value: code },
      ],
    });

    var requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("https://api.sms.ir/v1/send/verify", requestOptions)
      .then(response => response.text())
      .then(result => {
        setLoading(false)
        setCode(code);
        setVerifyCodeStatus(true);
        setIsTimerRunning(true);
        setTimer(90);
        toast({
          variant: 'success',
          title: 'کد تایید ارسال شد',
          description: 'لطفاً کد تایید را وارد کنید',
        });
      })
      .catch(error => {
        setLoading(false)
        toast({
          variant: 'destructive',
          title: 'متاسفانه انجام نشد',
          description: 'ارسال کد تایید ناموفق بود، دوباره تلاش کنید',
        });
      });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    if (enteredCode.length !== 4 || enteredCode !== code?.toString()) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'کد تایید اشتباه است',
      });
      return;
    }

    if (enteredCode === code?.toString()) {
      axios.post(API.SIGN_UP, { phone: `${phone}` })
        .then((res: any) => {
          setLoading(false)
          const token = res.data.token;
          Cookies.set('auth_token', token, { expires: 1 });
          login({ id: res.data.id || '1', phone: phone, token });
          toast({
            variant: 'success',
            title: 'موفقیت',
            description: 'با موفقیت وارد شدید',
          });
          router.push('/');
        }).catch((err) => {
          setLoading(false)
          toast({
            variant: 'destructive',
            title: 'ناموفق',
            description: 'متاسفانه انجام نشد مجدد تلاش کنید',
          });
        });
    } else {
      setLoading(false)
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'کد تایید اشتباه است',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-2xl font-bold">شهروند (جمع آوری پسماند)</div>
      <div className="flex h-[35vh] md:h-[40vh] max-w-[450px] md:w-[450px] overflow-hidden rounded-lg">
        <img
          src="/img/re.jpg"
          alt="Construction Hero"
          className="object-cover h-full w-full"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            زندگی سالم در محیط سالم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">شماره همراه</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="شماره همراه خود را وارد کنید"
                  type="tel"
                  value={phone}
                  disabled={loading || verifyCodeStatus}
                  onChange={handlePhoneChange}
                  className="pr-10"
                  required
                />
              </div>
              {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
            </div>
            {verifyCodeStatus && (
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="code">کد تایید</Label>
                  <Input
                    id="code"
                    placeholder="کد تایید را وارد کنید"
                    type="number"
                    maxLength={4}
                    lang="en"
                    value={enteredCode}
                    disabled={loading}
                    onChange={handleCodeChange}
                    className="pr-10"
                    required
                  />
                  {/* {codeError && <p className="text-red-500 text-sm">{codeError}</p>} */}
                </div>
                {timer > 0 && <div className="text-sm text-muted-foreground">
                  <div className="text-sm text-muted-foreground text-center py-4 px-2">
                    {timer > 0
                      ? ` ${formatTimer(timer)} دقیقه دیگر کد را مجدد دریافت کنید.`
                      : ''}
                  </div>
                </div>}
              </div>
            )}
            {!verifyCodeStatus && (
              <Button
                disabled={loading || phone.length !== 11 || !!phoneError}
                onClick={handleSendCode}
                variant={'secondary'}
                className="w-full bg-secondary text-background"
              >
                {
                  loading ? <LoadingSpinner className='text-[secondary]' /> : "ارسال کد تایید"
                }
              </Button>
            )}
            {verifyCodeStatus && timer === 0 && (
              <Button
                disabled={loading }
                onClick={handleSendCode}
                variant={'secondary'}
                className="w-full bg-secondary text-background"
              >
                {
                  loading ? <LoadingSpinner className='text-[secondary]' /> : "ارسال مجدد کد تایید"
                }
              </Button>
            )}
            {verifyCodeStatus && (
              <Button
                disabled={loading || enteredCode.length !== 4 || !!codeError}
                onClick={handleVerifyCode}
                variant={'secondary'}
                className="w-full bg-secondary text-background"
              >
                {
                  loading ? <LoadingSpinner className='text-[secondary]' /> : "تایید کد"
                }
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}