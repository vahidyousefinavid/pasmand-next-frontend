import GuidePage from "@/components/views/Guide/guide";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'راهنما اپلیکیشن',
  description: ''
}

export default function Guide() {
  return (
    <GuidePage />
  );
}