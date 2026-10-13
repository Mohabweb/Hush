import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Sparkles } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.7 },
};

export default function About() {
  return (
    <section id="about" className="relative py-32 lg:py-40 bg-dark">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div {...fadeInUp} className="mb-20">
          <p className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-4">About</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter-custom">
            A bit about me
            <span className="text-accent">.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-16 lg:gap-20">
          {/* Main text — takes 3 cols */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.15 }}
            className="lg:col-span-3 space-y-6"
          >
            <p className="font-body text-lg lg:text-xl text-white/80 leading-relaxed">
              I'm a Software Industry & Multimedia student at Alexandria University with a growing focus on web development. I enjoy taking an idea — whether it's mine or someone else's — and turning it into something real that works in a browser.
            </p>
            <p className="font-body text-base lg:text-lg text-muted leading-relaxed">
              I care about understanding what I'm building. I work with React and TypeScript, and I'm deepening my frontend skills while starting to explore backend and full-stack development.
            </p>
            <p className="font-body text-base lg:text-lg text-muted leading-relaxed">
              I'm still early in my journey, and I'm honest about that. But I'm building real projects, learning every day, and getting better with each one. That's the part that excites me most.
            </p>
          </motion.div>

          {/* Info cards — takes 2 cols */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Location */}
            <div className="group p-6 bg-dark-50 border border-white/5 rounded-2xl hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MapPin size={16} className="text-accent" />
                </div>
                <span className="font-body text-xs uppercase tracking-widest text-muted">Location</span>
              </div>
              <p className="font-display text-lg font-semibold text-white">Alexandria, Egypt</p>
            </div>

            {/* Education */}
            <div className="group p-6 bg-dark-50 border border-white/5 rounded-2xl hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <GraduationCap size={16} className="text-accent" />
                </div>
                <span className="font-body text-xs uppercase tracking-widest text-muted">Education</span>
              </div>
              <p className="font-display text-lg font-semibold text-white">Alexandria University</p>
              <p className="font-body text-sm text-muted mt-1">Software Industry & Multimedia</p>
              <p className="font-body text-xs text-muted/60 mt-1">2025 – Expected 2029</p>
            </div>

            {/* Focus */}
            <div className="group p-6 bg-dark-50 border border-white/5 rounded-2xl hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Sparkles size={16} className="text-accent" />
                </div>
                <span className="font-body text-xs uppercase tracking-widest text-muted">Focus</span>
              </div>
              <p className="font-display text-lg font-semibold text-white">Web Development</p>
              <p className="font-body text-sm text-muted mt-1">React & TypeScript</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
