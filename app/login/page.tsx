import LoginPage from "@/components/views/Login/login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'ورود و ثبت نام',
  description: ''
}

export default function Login() {
  return (
    <LoginPage />
  );
}