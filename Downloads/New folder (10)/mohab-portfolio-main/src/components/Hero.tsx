import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark"
    >
      {/* Ambient background */}
      <div className="absolute inset-0">
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-[120px]" />
        {/* Top-left subtle glow */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-[80px]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
      </div>

      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display font-bold text-[12vw] lg:text-[14vw] text-white/[0.02] tracking-tighter-custom uppercase whitespace-nowrap">
          PORTFOLIO
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-32 lg:py-0">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-6"
            >
              Hi, I'm
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-display font-bold tracking-tighter-custom leading-[0.85]"
            >
              <span className="block text-[clamp(3rem,10vw,8rem)] text-white">
                MOHAB
              </span>
              <span className="block text-[clamp(3rem,10vw,8rem)] text-white/90">
                ELSAN
                <span className="text-accent">HORY</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="font-body text-muted text-base lg:text-lg max-w-md mt-8 leading-relaxed mx-auto lg:mx-0"
            >
              Web developer building modern, responsive websites with React and TypeScript. Still learning, still building — one project at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-wrap gap-4 mt-10 justify-center lg:justify-start"
            >
              <button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-body text-sm font-medium tracking-wide rounded-full transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">View Projects</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 border border-white/10 hover:border-accent/50 text-white font-body text-sm font-medium tracking-wide rounded-full transition-all duration-300 hover:bg-accent/5"
              >
                Get in Touch
              </button>
            </motion.div>
          </div>

          {/* Right: Portrait + Typography */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center">
            {/* Floating side text */}
            <div className="absolute -right-4 lg:right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end gap-2 z-20">
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="font-display text-5xl xl:text-6xl font-bold text-white/[0.06] tracking-tighter-custom"
              >
                UI
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="font-display text-5xl xl:text-6xl font-bold text-white/[0.06] tracking-tighter-custom"
              >
                WEB
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="font-display text-5xl xl:text-6xl font-bold text-white/[0.06] tracking-tighter-custom"
              >
                DEV
              </motion.span>
            </div>

            {/* Portrait container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative w-[280px] h-[340px] sm:w-[320px] sm:h-[400px] lg:w-[400px] lg:h-[500px]"
            >
              {/* Blue glow behind portrait */}
              <div className="absolute inset-0 bg-accent/10 rounded-2xl blur-[60px] scale-90" />
              {/* Rim light effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-t from-transparent via-accent/10 to-accent/5 rounded-2xl" />
              
              {/* Portrait image */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img
                  src="/portrait.png"
                  alt="Mohab Elsanhory - Web Developer"
                  className="w-full h-full object-cover object-top grayscale contrast-110 brightness-90"
                  style={{ 
                    maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                  }}
                />
              </div>

              {/* Corner accent */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-r-2 border-b-2 border-accent/20 rounded-br-2xl" />
              <div className="absolute -top-2 -left-2 w-16 h-16 border-l-2 border-t-2 border-accent/20 rounded-tl-2xl" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-muted hover:text-accent transition-colors cursor-pointer z-10"
        aria-label="Scroll to about section"
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em]">Scroll Down</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-current to-transparent overflow-hidden">
          <motion.div
            className="w-full h-4 bg-current"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <ChevronDown size={14} className="animate-bounce" />
      </motion.button>
    </section>
  );
}
