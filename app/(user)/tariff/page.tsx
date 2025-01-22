import TariffPage from "@/components/views/Tariff/tariff";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'قیمت روز اقلام بازیافتی',
  description: ''
}

export default function Tariff() {
  return (
    <TariffPage />
  );
}