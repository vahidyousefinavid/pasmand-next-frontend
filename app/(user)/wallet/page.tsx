import WalletPage from "@/components/views/Wallet/wallet";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'گیف پول',
  description: ''
}

export default function Wallet() {
  return (
    <WalletPage />
  );
}