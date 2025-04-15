import ContactUsPage from "@/components/views/ContactUs/contact-us";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'تماس با ما',
  description: ''
}

export default function ContactUs() {
  return (
    <ContactUsPage />
  );
}