'use client';

import { useState } from "react";
import FirstStep from "./steps/first";
import SecondStep from "./steps/second";
import ThirdStep from "./steps/third";

interface RequestData {
  wasteType?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timeSlot?: {
    date: string;
    time: string;
  };
}

export default function NewRequestView() {
  const [step, setStep] = useState('first');
  const [requestData, setRequestData] = useState<RequestData>({});

  const handleWasteTypeSelect = (wasteType: string) => {
    setRequestData({ ...requestData, wasteType });
    setStep('second');
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setRequestData({ ...requestData, location });
    setStep('third');
  };

  const handleTimeSlotSelect = (timeSlot: { date: string; time: string }) => {
    setRequestData({ ...requestData, timeSlot });
    setStep('success');
  };

  const renderContent = (step: string) => {
    switch (step) {
      case 'first':
        return <FirstStep onNext={handleWasteTypeSelect} />;
      case 'second':
        return (
          <SecondStep
            onNext={handleLocationSelect}
            onBack={() => setStep('first')}
          />
        );
      case 'third':
        return (
          <ThirdStep
            onComplete={handleTimeSlotSelect}
            onBack={() => setStep('second')}
          />
        );
      case 'success':
        return (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-green-600 mb-4">درخواست شما با موفقیت ثبت شد! 🎉</h2>
              <p className="text-gray-600">
                درخواست جمع‌آوری پسماند شما دریافت شد. ما پسماند {requestData.wasteType} شما را در تاریخ {requestData.timeSlot?.date} بین ساعت {requestData.timeSlot?.time} جمع‌آوری خواهیم کرد.
              </p>
              <button
                onClick={() => {
                  setStep('first');
                  setRequestData({});
                }}
                className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                ثبت درخواست جدید
              </button>
            </div>
          </div>
        );
      default:
        return <div>مرحله نامشخص</div>;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-[120px]">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            درخواست جمع‌آوری پسماند
          </h1>
          <div className="flex justify-center space-x-4 space-x-reverse">
            {['first', 'second', 'third'].map((stepName, index) => (
              <div
                key={stepName}
                className="flex items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full bg-[hsl(25,84%,48%)] flex items-center justify-center ${
                    ['first', 'second', 'third'].indexOf(step) >= index
                      ? 'bg-[hsl(25,84%,48%)] text-white'
                      : 'bg-[hsl(25,84%,48%)] text-white'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      ['first', 'second', 'third'].indexOf(step) > index
                        ? 'bg-[hsl(25,84%,48%)]'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        {renderContent(step)}
      </div>
    </div>
  );
}