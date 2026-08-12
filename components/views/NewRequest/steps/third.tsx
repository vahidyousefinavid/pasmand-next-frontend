'use client';

import { useState } from 'react';
import ReactDatePicker from 'react-multi-date-picker';
import moment from 'jalali-moment';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { CalendarClock, ChevronRight, ChevronLeft, Sun, Sunset, Loader2 } from 'lucide-react';
import './index.css';
import { C, S, alpha } from '@/components/ui/tokens';
import { Card, Btn } from '@/components/ui/kit';

interface ThirdStepProps {
  loading: boolean;
  onComplete: (timeSlot: { date: string; time: string }) => void;
  onBack: () => void;
}

/**
 * Step three — when the collector should come.
 *
 * The four windows are labelled morning/afternoon rather than being four
 * identical grey boxes, because "which of these is the morning one" is the only
 * question a reader actually has here.
 */
const TIME_SLOTS = [
  { value: '۹:۰۰ - ۱۱:۰۰', part: 'صبح', Icon: Sun },
  { value: '۱۱:۰۰ - ۱۳:۰۰', part: 'اواخر صبح', Icon: Sun },
  { value: '۱۴:۰۰ - ۱۶:۰۰', part: 'بعدازظهر', Icon: Sunset },
  { value: '۱۶:۰۰ - ۱۸:۰۰', part: 'عصر', Icon: Sunset },
];

export default function ThirdStep({ onComplete, onBack, loading }: ThirdStepProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleDateChange = (date: any) => {
    setSelectedDate(date ? date.format('YYYY/MM/DD') : '');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
      <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>چه زمانی مراجعه کنیم؟</p>

      <Card>
        <div style={{ padding: `${S.s4}px`, display: 'flex', flexDirection: 'column', gap: S.s5 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: S.sm, fontWeight: 700, color: C.text, marginBottom: S.s2 }}>
              <CalendarClock className="h-4 w-4" style={{ color: C.green }} />
              تاریخ مراجعه
            </label>
            <ReactDatePicker
              value={selectedDate}
              onChange={handleDateChange}
              locale={persian_fa}
              calendar={persian}
              minDate={moment().toDate()}
              inputClass="pm-date-input"
              placeholder="انتخاب تاریخ"
            />
          </div>

          <div>
            <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.sm, fontWeight: 700, color: C.text }}>بازهٔ زمانی</p>
            <div style={{ display: 'grid', gap: S.s2, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              {TIME_SLOTS.map(({ value, part, Icon }) => {
                const isOn = selectedTime === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedTime(value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: S.s2, textAlign: 'start',
                      padding: `${S.s3}px ${S.s3}px`, borderRadius: S.r2, cursor: 'pointer',
                      background: isOn ? alpha(C.green, 12) : C.surface2,
                      border: `1.5px solid ${isOn ? C.green : C.border}`,
                      color: isOn ? C.green : C.text,
                      fontFamily: 'inherit',
                      transition: 'background .18s ease, border-color .18s ease',
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ flexShrink: 0, opacity: isOn ? 1 : 0.6 }} />
                    <span style={{ minWidth: 0 }}>
                      <span className="tnum" style={{ display: 'block', fontSize: S.sm, fontWeight: 800, direction: 'ltr' }}>{value}</span>
                      <span style={{ display: 'block', fontSize: S.xs, color: isOn ? C.green : C.muted, marginTop: 2 }}>{part}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: S.s3 }}>
        <Btn variant="ghost" onClick={onBack}>
          <ChevronRight className="h-4 w-4" />
          بازگشت
        </Btn>
        <Btn
          full
          disabled={!selectedDate || !selectedTime || loading}
          onClick={() => onComplete({ date: selectedDate, time: selectedTime })}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4" />}
          ادامه و بازبینی
        </Btn>
      </div>
    </div>
  );
}
