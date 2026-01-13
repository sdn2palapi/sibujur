import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { VerificationSection } from "@/components/verification-section";
import { StatisticsSection } from "@/components/statistics-section";
import { AnimatedBackground } from "@/components/animated-background";

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-slate-50/50 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      <AnimatedBackground />
      <PublicHeader />

      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <VerificationSection />
        <StatisticsSection />
      </div>

      <PublicFooter />
    </main>
  );
}
