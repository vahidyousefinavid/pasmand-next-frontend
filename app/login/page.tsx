"use client"
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

export default function LoginPage() {
  const [verifyCodeStatus, setVerifyCodeStatus] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<number>();
  const [enteredCode, setEnteredCode] = useState('');
  const [timer, setTimer] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();

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
        toast({
          variant: 'destructive',
          title: 'متاسفانه انجام نشد',
          description: 'لطفاً کد تایید را مجدد دریافت کنید',
        });
      });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(enteredCode) === code) {
      axios.post(API.SIGN_UP, { phone: `${phone}` })
        .then((res: any) => {
          Cookies.set('auth_token', res.data.token, { expires: 1 });  
          toast({
            variant: 'success',
            title: 'موفقیت',
            description: 'با موفقیت وارد شدید',
          });
          router.push('/');
        }).catch((err) => {
          toast({
            variant: 'destructive',
            title: 'ناموفق',
            description: 'متاسفانه انجام نشد مجدد تلاش کنید',
          });
        });

    } else {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'کد تایید اشتباه است',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-2xl font-bold">جمع آوری پسماند</div>
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
                  type="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setVerifyCodeStatus(false);
                    setEnteredCode('');
                  }}
                  className="pr-10"
                  required
                />
              </div>
            </div>
            {verifyCodeStatus && (
              <div className="space-y-2">
                <Label htmlFor="code">کد تایید</Label>
                <Input
                  id="code"
                  placeholder="کد تایید را وارد کنید"
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  className="pr-10"
                  required
                />
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
                onClick={handleSendCode}
                variant={'secondary'}
                className="w-full bg-secondary text-background"
              >
                ارسال کد تایید
              </Button>
            )}
            {verifyCodeStatus && timer === 0 && (
              <Button
                onClick={handleSendCode}
                variant={'secondary'}
                className="w-full bg-secondary text-background"
              >
                ارسال مجدد کد تایید
              </Button>
            )}
            {verifyCodeStatus && (
              <Button
                onClick={handleVerifyCode}
                variant={'secondary'}
                className="w-full bg-secondary text-background"
              >
                تایید کد
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div >
  );
}
