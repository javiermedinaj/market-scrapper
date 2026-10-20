import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DinnerPlanner from "@/components/DinnerPlanner";

export const metadata: Metadata = {
  title: "Cena con IA - OfertasBA",
  description:
    "Armá una cena para hoy con productos reales y un presupuesto en pesos.",
};

export default function CenaPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="top" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <DinnerPlanner />
      </main>
      <Footer />
    </div>
  );
}
