import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-resume.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradients + texture overlay */}
      <div className="absolute inset-0 animate-gradient-shift opacity-70" style={{ background: 'var(--gradient-hero)', mixBlendMode: 'multiply' }} />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, hsl(217 91% 60% / 0.15), transparent 70%)' }} />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight bg-gradient-primary bg-clip-text text-transparent drop-shadow-sm">
            Craft Your Next Interview-Winning Resume
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Generate an adaptive, ATS-compliant resume precisely aligned with any job description. Structured parsing, keyword intelligence & automated delivery in one flow.
          </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="relative group bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg px-10 py-5 overflow-hidden"
              >
                <span className="relative z-10">Start Building</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,hsl(0_0%_100%/.25),transparent_70%)]" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-10 py-5 backdrop-blur-sm"
              >
                Live Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
              {FEATURES.map(f => (
                <div key={f.title} className="glass-card rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-primary opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 shadow-elegant text-primary-foreground text-2xl font-bold animate-float-pulse">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
};

const FEATURES = [
  { title: 'Intelligent Parsing', icon: 'AI', desc: 'Advanced heuristics extract structure, skills, and achievements even from messy PDFs.' },
  { title: 'ATS Optimization', icon: '✓', desc: 'Keyword coverage scoring & gap analysis aligned to the target role requirements.' },
  { title: 'Automation Ready', icon: '⚡', desc: 'One-click delivery via Make.com with multi-format output & format preservation.' },
  { title: 'Actionable Insights', icon: '📊', desc: 'Dynamic scoring reveals weak sections and missing impact verbs to iterate faster.' },
  { title: 'Format Preservation', icon: '🧬', desc: 'Retains original layout while upgrading content and ATS readability.' },
  { title: 'Privacy First', icon: '🔐', desc: 'Processing runs client-side before optional automation dispatch.' }
];