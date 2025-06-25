import HomeView from "@/components/views/Home/home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'برنامه شهر شهر (شهروند)',
  description: ''
}

export default function Home() {
  return (
    <HomeView />
  );
}