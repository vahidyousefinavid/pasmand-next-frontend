import ProfilePage from "@/components/views/Profile/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'صفحه پروفایل کاربری',
  description: ''
}

export default function Profile() {
  return (
    <ProfilePage />
  );
}