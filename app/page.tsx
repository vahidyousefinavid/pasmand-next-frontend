import HomeView from "@/components/views/Home/home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'برنامه شهروند (شهر شهر)',
  description: ''
}

export default function Home() {
  return (
    <HomeView />
  );
}