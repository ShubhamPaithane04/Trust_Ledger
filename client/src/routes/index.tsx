import { createFileRoute } from "@tanstack/react-router";
import { ParticleBackground } from "@/components/chainverify/ParticleBackground";
import { ScrollProgress } from "@/components/chainverify/ScrollProgress";
import { Hero } from "@/components/chainverify/Hero";
import { ProblemSection } from "@/components/chainverify/ProblemSection";
import { Pipeline } from "@/components/chainverify/Pipeline";
import { AIEngine } from "@/components/chainverify/AIEngine";
import { Blockchain } from "@/components/chainverify/Blockchain";
import { DashboardPreview } from "@/components/chainverify/DashboardPreview";
import { TrustScoreDemo } from "@/components/chainverify/TrustScoreDemo";
import { TechStack } from "@/components/chainverify/TechStack";
import { Timeline } from "@/components/chainverify/Timeline";
import { Footer } from "@/components/chainverify/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ChainVerify - AI + Blockchain Product Authentication" },
      {
        name: "description",
        content:
          "AI-powered anomaly detection meets cryptographic blockchain. ChainVerify protects global supply chains with real-time counterfeit detection.",
      },
      { property: "og:title", content: "ChainVerify - AI + Blockchain Product Authentication" },
      {
        property: "og:description",
        content: "Real-time counterfeit detection powered by SHA-256 blockchain and 3 AI algorithms.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="relative">
      <ScrollProgress />
      <ParticleBackground />
      <Hero />
      <ProblemSection />
      <Pipeline />
      <AIEngine />
      <Blockchain />
      <DashboardPreview />
      <TrustScoreDemo />
      <TechStack />
      <Timeline />
      <Footer />
    </main>
  );
}
