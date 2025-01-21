import { useState } from 'react';
import ReactDatePicker from 'react-multi-date-picker';
import moment from 'jalali-moment';
import 'react-multi-date-picker/styles/colors/purple.css'; 
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import './index.css'
interface ThirdStepProps {
  onComplete: (timeSlot: { date: string; time: string }) => void;
  onBack: () => void;
}

export default function ThirdStep({ onComplete, onBack }: ThirdStepProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const timeSlots = [
    '۹:۰۰ - ۱۱:۰۰',
    '۱۱:۰۰ - ۱۳:۰۰',
    '۱۴:۰۰ - ۱۶:۰۰',
    '۱۶:۰۰ - ۱۸:۰۰'
  ];

  const handleDateChange = (date: any) => {
    if (date) {
      const persianDate = date.format('YYYY/MM/DD'); 
      setSelectedDate(persianDate);
    } else {
      setSelectedDate('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">زمان جمع‌آوری را انتخاب کنید</h2>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className='flex w-full flex-col'>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            انتخاب تاریخ
          </label>
          <ReactDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            locale={persian_fa} 
            calendar={persian} 
            minDate={moment().toDate()} 
            className="react-date-picker w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              display:'flex',
              width:'100%',
              minHeight:'40px',
              borderRadius:'10px'
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            انتخاب بازه زمانی
          </label>
          <div className="grid grid-cols-2 gap-4">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`p-4 rounded-lg border ${
                  selectedTime === slot
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => onComplete({ date: selectedDate, time: selectedTime })}
            disabled={!selectedDate || !selectedTime}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ثبت درخواست
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}
