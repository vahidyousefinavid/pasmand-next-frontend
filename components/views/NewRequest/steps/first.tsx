import { Trash2, Recycle, Box, Battery, Car, Construction } from 'lucide-react';

interface WasteType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const wasteTypes: WasteType[] = [
  {
    id: 'household',
    name: 'پسماند خانگی',
    icon: <Trash2 className="w-8 h-8" />,
    description: 'زباله‌ها و پسماندهای معمولی خانگی'
  },
  {
    id: 'recyclable',
    name: 'قابل بازیافت',
    icon: <Recycle className="w-8 h-8" />,
    description: 'کاغذ، پلاستیک، شیشه و فلزات'
  },
  {
    id: 'electronic',
    name: 'الکترونیکی',
    icon: <Battery className="w-8 h-8" />,
    description: 'وسایل الکترونیکی و باتری‌ها'
  },
  {
    id: 'bulky',
    name: 'اقلام حجیم',
    icon: <Box className="w-8 h-8" />,
    description: 'مبلمان و وسایل بزرگ'
  },
  {
    id: 'automotive',
    name: 'خودرو',
    icon: <Car className="w-8 h-8" />,
    description: 'قطعات و مایعات خودرو'
  },
  {
    id: 'construction',
    name: 'ساختمانی',
    icon: <Construction className="w-8 h-8" />,
    description: 'مصالح ساختمانی و نخاله‌ها'
  }
];

interface FirstStepProps {
  onNext: (wasteType: string) => void;
}

export default function FirstStep({ onNext }: FirstStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">نوع پسماند را انتخاب کنید</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wasteTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onNext(type.id)}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center space-y-3 border border-gray-200 hover:border-blue-500"
          >
            <div className="p-3 bg-blue-50 rounded-full">
              {type.icon}
            </div>
            <h3 className="font-semibold text-lg">{type.name}</h3>
            <p className="text-gray-600 text-sm text-center">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}