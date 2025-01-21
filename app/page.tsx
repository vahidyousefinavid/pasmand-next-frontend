import HomeView from "@/components/views/Home/home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'برنامه جمع آوری پسماند',
  description: ''
}

export default function Home() {
  return (
    <HomeView />
  );
}