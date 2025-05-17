'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Phone, Leaf, X, Building2, MapPin } from 'lucide-react';
import axios from "axios";
import { API } from '@/services/const';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities } from '@/variables';
import { Drawer } from '@/components/ui/drawer';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [verifyCodeStatus, setVerifyCodeStatus] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<number>();
  const [enteredCode, setEnteredCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [showCitySelect, setShowCitySelect] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const checkLocalStorage = async () => {
    const savedCity = localStorage.getItem('selectedCity');
    const savedPhone = localStorage.getItem('userPhone');

    if (savedCity && cities.find(city => city.id === savedCity)) {
      setSelectedCity(savedCity);
      setShowCitySelect(false);
      const cityData = cities.find(city => city.id === savedCity);
      if (cityData) {
        setWelcomeMessage(`به سامانه مدیریت پسماند ${cityData.name} خوش آمدید`);
      }

    }
    if (savedPhone) {
      setPhone(savedPhone);
      setWelcomeMessage(prev =>
        prev ? `${prev}\nشماره همراه شما: ${savedPhone}` : `شماره همراه شما: ${savedPhone}`
      );
    }
    if (!isDrawerOpen) {
      setIsDrawerOpen(true)
    }
  };

  useEffect(() => {
    checkLocalStorage();

  }, []);

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
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
    setVerifyCodeStatus(false);
    setEnteredCode(['', '', '', '']);

    if (/^09\d{9}$/.test(value) || value === '') {
      setPhoneError('');
    } else {
      setPhoneError('شماره موبایل معتبر نیست');
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...enteredCode];
      newCode[index] = value;
      setEnteredCode(newCode);

      if (value !== '' && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !enteredCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCitySelect = (value: string) => {
    setSelectedCity(value);
    localStorage.setItem('selectedCity', value);
    setShowCitySelect(false);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        setLoading(false);
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
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'متاسفانه انجام نشد',
          description: 'ارسال کد تایید ناموفق بود، دوباره تلاش کنید',
        });
      });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedCode = enteredCode.join('');
    setLoading(true);

    if (combinedCode.length !== 4 || combinedCode !== code?.toString()) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'کد تایید اشتباه است',
      });
      return;
    }

    if (combinedCode === code?.toString()) {
      axios.post(API.SIGN_UP, { phone: `${phone}`, city: selectedCity })
        .then((res: any) => {
          setLoading(false);
          const token = res.data.token;
          Cookies.set('auth_token', token, { expires: 1 });
          localStorage.setItem('userPhone', phone);
          login({ id: res.data.id || '1', phone: phone, token });
          toast({
            variant: 'success',
            title: 'موفقیت',
            description: 'با موفقیت وارد شدید',
          });
          router.push('/');
        }).catch((err) => {
          setLoading(false);
          toast({
            variant: 'destructive',
            title: 'ناموفق',
            description: 'متاسفانه انجام نشد مجدد تلاش کنید',
          });
        });
    }
  };

  const selectedCityData = cities.find(city => city.id === selectedCity);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('img/back.webp')`
      }}
    >
      <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(4px)' }} />
      <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-between p-6">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-full">
              <Leaf className="w-8 h-8 text-green-400" />
            </div>
            {selectedCityData && (
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full">
                <img
                  src={selectedCityData.icon}
                  alt={selectedCityData.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">شهروند سبز</h1>
              <p className="text-green-200 text-sm md:text-base">
                {selectedCityData ? `شهرداری ${selectedCityData.name}` : 'مدیریت هوشمند پسماند'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 my-auto">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              برای زمینی پاک‌تر
            </h2>
            <p className="text-lg md:text-xl text-green-100">
              با مدیریت هوشمند پسماند، به حفظ محیط زیست کمک کنید
            </p>
          </div>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-secondary/100 hover:bg-secondary/200 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            شروع کنید
          </Button>
        </div>

        <div className="w-full max-w-7xl mx-auto text-center">
          {/* <p className="text-white/60">با همکاری سازمان مدیریت پسماند شهرداری</p> */}
        </div>
      </div>

      <Drawer open={isDrawerOpen}>
        <div
          dir="rtl"
          className={`
      fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl
      transition-transform duration-300
      ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}
    `}
        >
          <div className="relative w-full max-w-2xl mx-auto p-6">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {showCitySelect
                    ? 'انتخاب شهر'
                    : verifyCodeStatus
                      ? 'تایید شماره همراه'
                      : 'ورود به حساب کاربری'}
                </h3>
                <p className="mt-2 text-gray-600">
                  {showCitySelect
                    ? 'لطفا شهر خود را انتخاب کنید'
                    : verifyCodeStatus
                      ? 'کد تایید ارسال شده را وارد کنید'
                      : 'لطفا شماره همراه خود را وارد کنید'}
                </p>
              </div>

              <form className="space-y-4">
                {showCitySelect ? (
                  <div className="space-y-4">
                    <Label htmlFor="city" className="text-gray-700">شهر</Label>
                    <Select onValueChange={handleCitySelect}>
                      <SelectTrigger className="w-full h-14 text-lg" dir="rtl">
                        <SelectValue placeholder="شهر خود را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>{city.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : !verifyCodeStatus ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">شماره همراه</Label>
                    <div className="relative">
                      <Input
                        dir='rtl'
                        id="phone"
                        placeholder="شماره همراه خود را وارد کنید"
                        type="tel"
                        value={phone}
                        disabled={loading || verifyCodeStatus}
                        onChange={handlePhoneChange}
                        className="pl-10 py-6 text-lg rounded-xl border-gray-200"
                        required
                      />
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label htmlFor="code" className="text-gray-700">کد تایید</Label>
                    <div className="flex justify-center gap-2">
                      {[3, 2, 1, 0].map((index) => (
                        <Input
                          key={index}
                          ref={el => inputRefs.current[index] = el}
                          type="tel"
                          inputMode="numeric" 
                          pattern="\d*"       
                          maxLength={1}
                          value={enteredCode[index]}
                          onChange={(e) => handleCodeChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-14 h-14 text-center text-2xl rounded-xl border-gray-200"
                          disabled={loading}
                        />
                      ))}
                    </div>
                    {timer > 0 && (
                      <div className="text-sm text-gray-500 text-center mt-4">
                        {formatTimer(timer)} دقیقه دیگر کد را مجدد دریافت کنید
                      </div>
                    )}
                  </div>
                )}

                {!showCitySelect && !verifyCodeStatus && (
                  <>
                    <Button
                      disabled={loading || phone.length !== 11 || !!phoneError}
                      onClick={handleSendCode}
                      className="w-full bg-secondary/100 hover:bg-secondary/200 text-white py-6 text-lg rounded-xl"
                    >
                      {loading ? <LoadingSpinner className="text-white" /> : "ارسال کد تایید"}
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={() => {
                        setSelectedCity('')
                        localStorage.removeItem('selectedCity')
                        setShowCitySelect(true)
                      }}
                      className="w-full py-1 text-md rounded-xl"
                    >
                      اصلاح شهر
                    </Button>
                  </>
                )}

                {verifyCodeStatus && timer === 0 && (
                  <Button
                    disabled={loading}
                    onClick={handleSendCode}
                    className="w-full bg-secondary/100 hover:bg-secondary/200 text-white py-6 text-lg rounded-xl"
                  >
                    {loading ? <LoadingSpinner className="text-white" /> : "ارسال مجدد کد تایید"}
                  </Button>
                )}

                {verifyCodeStatus && (
                  <Button
                    disabled={loading || !Array.isArray(enteredCode) || enteredCode.some(digit => !digit)}
                    onClick={handleVerifyCode}
                    className="w-full bg-secondary/100 hover:bg-secondary/200 text-white py-6 text-lg rounded-xl"
                  >
                    {loading ? <LoadingSpinner className="text-white" /> : "تایید و ورود"}
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}