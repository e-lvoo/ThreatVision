import HeroSection from '@/components/landing/HeroSection';

const Index = () => {
  return (
    <main className="w-full min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <HeroSection />

      {/* Target for View Demo */}
      <section id="features-section" className="py-24 bg-[#0a0f24] relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Autonomous Security for the Modern Web</h2>
            <p className="text-xl text-gray-400">
              ThreatVision uses distributed neural networks to classify network traffic with unprecedented accuracy and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Real-time Detection", desc: "Analyze packets as they flow through your infrastructure with sub-millisecond latency." },
              { title: "AI-Powered", desc: "Leveraging DistilBERT transformers trained on millions of benign and malicious patterns." },
              { title: "Global Intelligence", desc: "Sync threat data across your entire network to block coordinated attacks instantly." }
            ].map((f, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-all hover:translate-y-[-4px]">
                <h3 className="text-xl font-bold mb-4 text-primary">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
