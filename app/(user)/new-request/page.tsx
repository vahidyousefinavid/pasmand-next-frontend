import NewRequestView from "@/components/views/NewRequest/new-request";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'درخواست جدید',
  description: ''
}

export default function NewRequest() {
  return (
    <NewRequestView />
  );
}