import AddressesPage from "@/components/views/Addresse/adresses";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'آدرس های ثبت شده',
  description: ''
}

export default function Addresses() {
  return (
    <AddressesPage />
  );
}